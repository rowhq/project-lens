/**
 * Appraisal Router
 * Handles appraisal request operations
 */

import { z } from "zod";
import {
  createTRPCRouter,
  clientProcedure,
  protectedProcedure,
  adminProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  processAppraisal,
  retryAppraisal,
  processQueuedAppraisals,
} from "@/server/services/appraisal-processor";
import { calculateAppraisalPrice } from "@/server/services/pricing-engine";
import { PRICING } from "@/shared/config/constants";
import {
  getUsageStatus,
  checkUsageForPayment,
} from "@/server/services/usage-limiter";
import * as stripe from "@/shared/lib/stripe";
import { deleteFile } from "@/shared/lib/storage";
// Note: Email sending and job dispatch are now handled by the Stripe webhook
// to prevent race conditions between webhook and confirmPayment

export const appraisalRouter = createTRPCRouter({
  /**
   * Get usage status - free reports remaining this month
   */
  usageStatus: clientProcedure.query(async ({ ctx }) => {
    const status = await getUsageStatus(ctx.organization!.id);
    return status;
  }),

  /**
   * Check if payment is required for a new AI report
   */
  checkPaymentRequired: clientProcedure.query(async ({ ctx }) => {
    const { requiresPayment, usageStatus } = await checkUsageForPayment(
      ctx.organization!.id,
    );
    return {
      requiresPayment,
      freeRemaining: usageStatus.remaining,
      used: usageStatus.used,
      limit: usageStatus.limit,
      unlimited: usageStatus.unlimited,
    };
  }),

  /**
   * Create a new appraisal request
   */
  create: clientProcedure
    .input(
      z.object({
        propertyId: z.string().optional(),
        propertyAddress: z.string().optional(),
        propertyCity: z.string().optional(),
        propertyState: z.string().default("TX"),
        propertyZipCode: z.string().optional(),
        propertyType: z
          .enum([
            "SINGLE_FAMILY",
            "MULTI_FAMILY",
            "CONDO",
            "TOWNHOUSE",
            "COMMERCIAL",
            "LAND",
            "MIXED_USE",
          ])
          .default("SINGLE_FAMILY"),
        purpose: z.string(),
        requestedType: z.enum([
          "AI_REPORT",
          "AI_REPORT_WITH_ONSITE",
          "CERTIFIED_APPRAISAL",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let propertyId = input.propertyId;

      // If no propertyId, create a new property
      if (!propertyId && input.propertyAddress) {
        const property = await ctx.prisma.property.create({
          data: {
            addressLine1: input.propertyAddress,
            city: input.propertyCity || "",
            county: "", // Will be enriched later
            state: input.propertyState,
            zipCode: input.propertyZipCode || "",
            addressFull: `${input.propertyAddress}, ${input.propertyCity || ""}, ${input.propertyState} ${input.propertyZipCode || ""}`,
            latitude: 0, // Will be geocoded later
            longitude: 0,
            propertyType: input.propertyType,
          },
        });
        propertyId = property.id;
      }

      if (!propertyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either propertyId or property address is required",
        });
      }

      // Verify property exists
      const property = await ctx.prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      // Calculate price using pricing engine
      const pricingResult = await calculateAppraisalPrice({
        propertyType: property.propertyType,
        county: property.county,
        state: property.state,
        requestedType: input.requestedType,
      });
      const price = pricingResult.finalPrice;

      // Create appraisal request
      const appraisal = await ctx.prisma.appraisalRequest.create({
        data: {
          organizationId: ctx.organization!.id,
          requestedById: ctx.user.id,
          propertyId,
          purpose: input.purpose,
          requestedType: input.requestedType,
          notes: input.notes,
          status: "QUEUED",
          price,
        },
        include: {
          property: true,
          requestedBy: true,
        },
      });

      // Process AI Report appraisals immediately (sync for Vercel serverless)
      if (input.requestedType === "AI_REPORT") {
        try {
          await processAppraisal(appraisal.id);
        } catch (error) {
          console.error(`Failed to process appraisal ${appraisal.id}:`, error);
          // Don't throw - appraisal is created, cron will retry
        }
      }

      return appraisal;
    }),

  /**
   * Get appraisal by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.id },
        include: {
          property: true,
          requestedBy: true,
          report: true,
          jobs: true,
        },
      });

      if (!appraisal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appraisal not found",
        });
      }

      // Check access
      if (
        ctx.user.role === "CLIENT" &&
        appraisal.organizationId !== ctx.organization?.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return appraisal;
    }),

  /**
   * List appraisals for organization
   */
  list: clientProcedure
    .input(
      z.object({
        status: z
          .enum(["DRAFT", "QUEUED", "RUNNING", "READY", "FAILED", "EXPIRED"])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input;

      const appraisals = await ctx.prisma.appraisalRequest.findMany({
        where: {
          organizationId: ctx.organization!.id,
          deletedAt: null, // Exclude soft-deleted
          ...(status && { status }),
        },
        include: {
          property: true,
          report: {
            select: {
              id: true,
              valueEstimate: true,
              confidenceScore: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (appraisals.length > limit) {
        const nextItem = appraisals.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: appraisals,
        nextCursor,
      };
    }),

  /**
   * Create appraisal with Stripe checkout
   * Returns a checkout URL to redirect the user to
   */
  createWithCheckout: clientProcedure
    .input(
      z.object({
        propertyAddress: z.string(),
        propertyCity: z.string().optional(),
        propertyState: z.string().default("TX"),
        propertyZipCode: z.string().optional(),
        propertyType: z
          .enum([
            "SINGLE_FAMILY",
            "MULTI_FAMILY",
            "CONDO",
            "TOWNHOUSE",
            "COMMERCIAL",
            "LAND",
            "MIXED_USE",
          ])
          .default("SINGLE_FAMILY"),
        purpose: z.string(),
        requestedType: z.enum([
          "AI_REPORT",
          "AI_REPORT_WITH_ONSITE",
          "CERTIFIED_APPRAISAL",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create property
      const property = await ctx.prisma.property.create({
        data: {
          addressLine1: input.propertyAddress,
          city: input.propertyCity || "",
          county: "",
          state: input.propertyState,
          zipCode: input.propertyZipCode || "",
          addressFull: `${input.propertyAddress}, ${input.propertyCity || ""}, ${input.propertyState} ${input.propertyZipCode || ""}`,
          latitude: 0,
          longitude: 0,
          propertyType: input.propertyType,
        },
      });

      // Calculate price
      const pricingResult = await calculateAppraisalPrice({
        propertyType: property.propertyType,
        county: property.county,
        state: property.state,
        requestedType: input.requestedType,
      });
      const price = pricingResult.finalPrice;

      // Create appraisal in DRAFT status (not yet paid)
      const appraisal = await ctx.prisma.appraisalRequest.create({
        data: {
          organizationId: ctx.organization!.id,
          requestedById: ctx.user.id,
          propertyId: property.id,
          purpose: input.purpose,
          requestedType: input.requestedType,
          notes: input.notes,
          status: "DRAFT",
          price,
        },
      });

      // Get product name based on type
      const productNames: Record<string, string> = {
        AI_REPORT: "AI Property Valuation Report",
        AI_REPORT_WITH_ONSITE: "AI Report with On-Site Verification",
        CERTIFIED_APPRAISAL: "Certified Property Appraisal",
      };

      // Create Stripe checkout session
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutSession = await stripe.createCheckoutSession({
        organizationId: ctx.organization!.id,
        appraisalRequestId: appraisal.id,
        priceInCents: Math.round(price * 100),
        productName: productNames[input.requestedType] || "Property Appraisal",
        customerEmail: ctx.user.email || "",
        successUrl: `${baseUrl}/appraisals/${appraisal.id}?payment=success`,
        cancelUrl: `${baseUrl}/appraisals/new?payment=cancelled`,
      });

      // Store the checkout session ID on the appraisal for verification later
      await ctx.prisma.appraisalRequest.update({
        where: { id: appraisal.id },
        data: {
          notes: input.notes
            ? `${input.notes}\n\nCheckout Session: ${checkoutSession.id}`
            : `Checkout Session: ${checkoutSession.id}`,
        },
      });

      return {
        appraisalId: appraisal.id,
        checkoutUrl: checkoutSession.url,
        price,
      };
    }),

  /**
   * Quick AI Report - Uses free monthly allowance or requires payment
   * This is the main endpoint for creating AI reports from the map
   */
  quickAIReport: clientProcedure
    .input(
      z.object({
        propertyAddress: z.string(),
        propertyCity: z.string().optional(),
        propertyState: z.string().default("TX"),
        propertyZipCode: z.string().optional(),
        propertyType: z
          .enum([
            "SINGLE_FAMILY",
            "MULTI_FAMILY",
            "CONDO",
            "TOWNHOUSE",
            "COMMERCIAL",
            "LAND",
            "MIXED_USE",
          ])
          .default("SINGLE_FAMILY"),
        propertyCounty: z.string().optional(),
        purpose: z.string().default("Property Analysis"),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check usage limits
      const { requiresPayment, usageStatus } = await checkUsageForPayment(
        ctx.organization!.id,
      );

      // In production, if payment required and Stripe not configured, throw error
      if (requiresPayment && process.env.NODE_ENV === "production") {
        throw new TRPCError({
          code: "PAYMENT_REQUIRED",
          message: `Monthly free report limit (${usageStatus.limit}) exceeded. Payment required.`,
        });
      }

      // Create property
      const property = await ctx.prisma.property.create({
        data: {
          addressLine1: input.propertyAddress,
          city: input.propertyCity || "",
          county: input.propertyCounty || "",
          state: input.propertyState,
          zipCode: input.propertyZipCode || "",
          addressFull: `${input.propertyAddress}, ${input.propertyCity || ""}, ${input.propertyState} ${input.propertyZipCode || ""}`,
          latitude: 0,
          longitude: 0,
          propertyType: input.propertyType,
        },
      });

      // Determine if this is a free report or paid
      const isFreeReport = !requiresPayment;
      const price = isFreeReport ? 0 : PRICING.AI_REPORT;

      // Generate reference code
      const refCode = `APR-${Date.now().toString(36).toUpperCase()}`;

      // Create appraisal directly in QUEUED status
      const appraisal = await ctx.prisma.appraisalRequest.create({
        data: {
          referenceCode: refCode,
          organizationId: ctx.organization!.id,
          requestedById: ctx.user.id,
          propertyId: property.id,
          purpose: input.purpose,
          requestedType: "AI_REPORT",
          notes: input.notes
            ? `${input.notes}\n\n[${isFreeReport ? "FREE REPORT" : "PAID REPORT"}]`
            : `[${isFreeReport ? "FREE REPORT" : "PAID REPORT"}]`,
          status: "QUEUED",
          statusMessage: isFreeReport
            ? `Free report (${usageStatus.used + 1}/${usageStatus.limit} this month)`
            : "Processing paid report",
          price,
        },
      });

      // Create payment record (even for free, to track usage)
      await ctx.prisma.payment.create({
        data: {
          organizationId: ctx.organization!.id,
          userId: ctx.user.id,
          type: "CHARGE",
          amount: price,
          currency: "USD",
          description: isFreeReport
            ? `[FREE] AI Report - ${property.addressFull}`
            : `AI Report - ${property.addressFull}`,
          relatedAppraisalId: appraisal.id,
          status: "COMPLETED",
          statusMessage: isFreeReport
            ? "Free monthly allowance"
            : "Paid report",
        },
      });

      // Process synchronously (required for Vercel serverless)
      try {
        console.log(
          `[QuickAIReport] Starting processAppraisal for ${appraisal.id}`,
        );
        const result = await processAppraisal(appraisal.id);
        console.log(
          `[QuickAIReport] processAppraisal result:`,
          JSON.stringify(result),
        );

        if (!result.success) {
          console.error(
            `[QuickAIReport] processAppraisal returned failure:`,
            result.error,
          );
          // Check current status - if still QUEUED somehow, schedule a retry
          const currentAppraisal = await ctx.prisma.appraisalRequest.findUnique(
            {
              where: { id: appraisal.id },
              select: { status: true, retryCount: true },
            },
          );

          if (currentAppraisal?.status === "QUEUED") {
            // Still QUEUED means processAppraisal didn't update status properly
            // Schedule a retry via cron
            await ctx.prisma.appraisalRequest.update({
              where: { id: appraisal.id },
              data: {
                nextRetryAt: new Date(Date.now() + 60000), // Retry in 1 minute
                retryCount: (currentAppraisal.retryCount || 0) + 1,
                statusMessage: `Processing failed: ${result.error}. Retry scheduled.`,
              },
            });
          }
        }
      } catch (error) {
        console.error(
          `[QuickAIReport] Exception in processAppraisal ${appraisal.id}:`,
          error,
        );
        // On exception, ensure appraisal is properly set for retry
        // processAppraisal should have set status to RUNNING, but let's make sure
        // we have a proper retry scheduled
        try {
          const currentAppraisal = await ctx.prisma.appraisalRequest.findUnique(
            {
              where: { id: appraisal.id },
              select: { status: true, retryCount: true },
            },
          );

          // If status is QUEUED or RUNNING (stuck), schedule retry
          if (
            currentAppraisal &&
            ["QUEUED", "RUNNING"].includes(currentAppraisal.status)
          ) {
            await ctx.prisma.appraisalRequest.update({
              where: { id: appraisal.id },
              data: {
                status: "QUEUED",
                nextRetryAt: new Date(Date.now() + 60000), // Retry in 1 minute
                retryCount: (currentAppraisal.retryCount || 0) + 1,
                statusMessage: `Exception: ${error instanceof Error ? error.message : "Unknown"}. Retry scheduled.`,
              },
            });
          }
        } catch (updateError) {
          console.error(
            `[QuickAIReport] Failed to schedule retry for ${appraisal.id}:`,
            updateError,
          );
        }
        // Don't throw - appraisal is created, cron will retry if needed
      }

      return {
        appraisalId: appraisal.id,
        referenceCode: refCode,
        price,
        isFreeReport,
        usageAfter: {
          used: usageStatus.used + 1,
          limit: usageStatus.limit,
          remaining:
            usageStatus.remaining !== null ? usageStatus.remaining - 1 : null,
        },
      };
    }),

  /**
   * Development-only checkout bypass (legacy - use quickAIReport instead)
   * Simulates successful payment without Stripe
   */
  devCheckout: clientProcedure
    .input(
      z.object({
        propertyAddress: z.string(),
        propertyCity: z.string().optional(),
        propertyState: z.string().default("TX"),
        propertyZipCode: z.string().optional(),
        propertyType: z
          .enum([
            "SINGLE_FAMILY",
            "MULTI_FAMILY",
            "CONDO",
            "TOWNHOUSE",
            "COMMERCIAL",
            "LAND",
            "MIXED_USE",
          ])
          .default("SINGLE_FAMILY"),
        propertyCounty: z.string().optional(),
        purpose: z.string(),
        requestedType: z.enum([
          "AI_REPORT",
          "AI_REPORT_WITH_ONSITE",
          "CERTIFIED_APPRAISAL",
        ]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Only allow in development
      if (process.env.NODE_ENV === "production") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Development checkout is not available in production",
        });
      }

      // Check usage limits for AI_REPORT
      const { requiresPayment, usageStatus } =
        input.requestedType === "AI_REPORT"
          ? await checkUsageForPayment(ctx.organization!.id)
          : {
              requiresPayment: true,
              usageStatus: { used: 0, limit: 0, remaining: 0 },
            };

      // Create property
      const property = await ctx.prisma.property.create({
        data: {
          addressLine1: input.propertyAddress,
          city: input.propertyCity || "",
          county: input.propertyCounty || "",
          state: input.propertyState,
          zipCode: input.propertyZipCode || "",
          addressFull: `${input.propertyAddress}, ${input.propertyCity || ""}, ${input.propertyState} ${input.propertyZipCode || ""}`,
          latitude: 0,
          longitude: 0,
          propertyType: input.propertyType,
        },
      });

      // Calculate price - FREE if within limit for AI_REPORT
      const isFreeReport =
        input.requestedType === "AI_REPORT" && !requiresPayment;
      const pricingResult = await calculateAppraisalPrice({
        propertyType: property.propertyType,
        county: property.county,
        state: property.state,
        requestedType: input.requestedType,
      });
      const price = isFreeReport ? 0 : pricingResult.finalPrice;

      // Generate reference code
      const refCode = `APR-${Date.now().toString(36).toUpperCase()}`;

      // Create appraisal directly in QUEUED status
      const appraisal = await ctx.prisma.appraisalRequest.create({
        data: {
          referenceCode: refCode,
          organizationId: ctx.organization!.id,
          requestedById: ctx.user.id,
          propertyId: property.id,
          purpose: input.purpose,
          requestedType: input.requestedType,
          notes: input.notes
            ? `${input.notes}\n\n[${isFreeReport ? "FREE REPORT" : "DEV MODE"}]`
            : `[${isFreeReport ? "FREE REPORT" : "DEV MODE"}]`,
          status: "QUEUED",
          statusMessage: isFreeReport
            ? `Free report (${usageStatus.used + 1}/${usageStatus.limit} this month)`
            : "Development mode - payment bypassed",
          price,
        },
      });

      // Create payment record
      await ctx.prisma.payment.create({
        data: {
          organizationId: ctx.organization!.id,
          userId: ctx.user.id,
          type: "CHARGE",
          amount: price,
          currency: "USD",
          description: isFreeReport
            ? `[FREE] ${input.requestedType.replace(/_/g, " ")} - ${property.addressFull}`
            : `[DEV] ${input.requestedType.replace(/_/g, " ")} - ${property.addressFull}`,
          relatedAppraisalId: appraisal.id,
          status: "COMPLETED",
          statusMessage: isFreeReport
            ? "Free monthly allowance"
            : "Development mode",
        },
      });

      // Process synchronously (required for Vercel serverless)
      try {
        await processAppraisal(appraisal.id);
      } catch (error) {
        console.error(
          `[DevCheckout] Failed to process appraisal ${appraisal.id}:`,
          error,
        );
        // Don't throw - appraisal is created, cron will retry
      }

      return {
        appraisalId: appraisal.id,
        referenceCode: refCode,
        price,
        isFreeReport,
      };
    }),

  /**
   * Verify payment status after Stripe redirect
   * Note: All processing is handled by the Stripe webhook to avoid race conditions
   * This endpoint just returns the current state for the UI
   */
  confirmPayment: clientProcedure
    .input(z.object({ appraisalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.appraisalId },
        include: { property: true, report: true },
      });

      if (!appraisal) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (appraisal.organizationId !== ctx.organization!.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // If still DRAFT after redirect, webhook hasn't processed yet
      // The UI should poll until status changes
      return appraisal;
    }),

  /**
   * Cancel appraisal request
   */
  cancel: clientProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.id },
      });

      if (!appraisal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appraisal not found",
        });
      }

      if (appraisal.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      if (!["DRAFT", "QUEUED"].includes(appraisal.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot cancel appraisal in current status",
        });
      }

      return ctx.prisma.appraisalRequest.update({
        where: { id: input.id },
        data: { status: "EXPIRED" },
      });
    }),

  /**
   * Delete appraisal request
   * - READY: Soft delete (set deletedAt) - preserves historical data
   * - QUEUED/FAILED/DRAFT/EXPIRED: Hard delete with R2 cleanup
   */
  delete: clientProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.id },
        include: { report: true },
      });

      if (!appraisal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appraisal not found",
        });
      }

      if (appraisal.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // READY appraisals: soft delete (preserve data)
      if (appraisal.status === "READY") {
        return ctx.prisma.appraisalRequest.update({
          where: { id: input.id },
          data: { deletedAt: new Date() },
        });
      }

      // Other statuses: hard delete with R2 cleanup
      // Delete PDF from R2 if exists
      if (appraisal.report?.pdfUrl) {
        try {
          // Extract key from URL: https://pub-xxx.r2.dev/reports/xxx/report.pdf -> reports/xxx/report.pdf
          const url = new URL(appraisal.report.pdfUrl);
          const key = url.pathname.slice(1); // Remove leading /
          await deleteFile(key);
        } catch (error) {
          console.error(
            `[AppraisalDelete] Failed to delete R2 file for ${input.id}:`,
            error,
          );
          // Continue with DB deletion even if R2 fails
        }
      }

      // Delete report first (if exists), then appraisal
      if (appraisal.reportId) {
        await ctx.prisma.report.delete({
          where: { id: appraisal.reportId },
        });
      }

      return ctx.prisma.appraisalRequest.delete({
        where: { id: input.id },
      });
    }),

  /**
   * Bulk delete appraisal requests
   * Same logic as single delete but for multiple appraisals
   */
  bulkDelete: clientProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Fetch all appraisals with their reports
      const appraisals = await ctx.prisma.appraisalRequest.findMany({
        where: {
          id: { in: input.ids },
          organizationId: ctx.organization!.id,
        },
        include: { report: true },
      });

      if (appraisals.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No appraisals found",
        });
      }

      const results = { softDeleted: 0, hardDeleted: 0, failed: 0 };

      for (const appraisal of appraisals) {
        try {
          if (appraisal.status === "READY") {
            // Soft delete for READY
            await ctx.prisma.appraisalRequest.update({
              where: { id: appraisal.id },
              data: { deletedAt: new Date() },
            });
            results.softDeleted++;
          } else {
            // Hard delete for others
            if (appraisal.report?.pdfUrl) {
              try {
                const url = new URL(appraisal.report.pdfUrl);
                const key = url.pathname.slice(1);
                await deleteFile(key);
              } catch (error) {
                console.error(
                  `[BulkDelete] Failed to delete R2 file for ${appraisal.id}:`,
                  error,
                );
              }
            }

            if (appraisal.reportId) {
              await ctx.prisma.report.delete({
                where: { id: appraisal.reportId },
              });
            }

            await ctx.prisma.appraisalRequest.delete({
              where: { id: appraisal.id },
            });
            results.hardDeleted++;
          }
        } catch (error) {
          console.error(
            `[BulkDelete] Failed to delete appraisal ${appraisal.id}:`,
            error,
          );
          results.failed++;
        }
      }

      return {
        total: appraisals.length,
        ...results,
      };
    }),

  /**
   * Manually trigger processing for an appraisal
   */
  process: clientProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.id },
      });

      if (!appraisal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appraisal not found",
        });
      }

      if (appraisal.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      if (!["QUEUED", "FAILED"].includes(appraisal.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Appraisal cannot be processed in current status",
        });
      }

      const result = await processAppraisal(input.id);

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Processing failed",
        });
      }

      return ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.id },
        include: {
          property: true,
          report: true,
        },
      });
    }),

  /**
   * Retry a failed appraisal
   */
  retry: clientProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.id },
      });

      if (!appraisal) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appraisal not found",
        });
      }

      if (appraisal.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      if (appraisal.status !== "FAILED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only failed appraisals can be retried",
        });
      }

      const result = await retryAppraisal(input.id);

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error || "Retry failed",
        });
      }

      return ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.id },
        include: {
          property: true,
          report: true,
        },
      });
    }),

  /**
   * Admin: Process all queued appraisals
   */
  processQueue: adminProcedure.mutation(async () => {
    const results = await processQueuedAppraisals();
    return {
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }),
});
