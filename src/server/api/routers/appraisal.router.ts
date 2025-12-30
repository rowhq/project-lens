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
import * as stripe from "@/shared/lib/stripe";
import { sendPaymentConfirmation, sendAppraisalOrderConfirmation } from "@/shared/lib/resend";
import { dispatchEngine } from "@/server/services/dispatch-engine";

export const appraisalRouter = createTRPCRouter({
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
        propertyType: z.enum([
          "SINGLE_FAMILY",
          "MULTI_FAMILY",
          "CONDO",
          "TOWNHOUSE",
          "COMMERCIAL",
          "LAND",
          "MIXED_USE",
        ]).default("SINGLE_FAMILY"),
        purpose: z.string(),
        requestedType: z.enum([
          "AI_REPORT",
          "AI_REPORT_WITH_ONSITE",
          "CERTIFIED_APPRAISAL",
        ]),
        notes: z.string().optional(),
      })
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

      // Process AI Report appraisals immediately
      if (input.requestedType === "AI_REPORT") {
        // Fire and forget - don't block the response
        processAppraisal(appraisal.id).catch((error) => {
          console.error(`Failed to process appraisal ${appraisal.id}:`, error);
        });
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
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, limit, cursor } = input;

      const appraisals = await ctx.prisma.appraisalRequest.findMany({
        where: {
          organizationId: ctx.organization!.id,
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
        propertyType: z.enum([
          "SINGLE_FAMILY",
          "MULTI_FAMILY",
          "CONDO",
          "TOWNHOUSE",
          "COMMERCIAL",
          "LAND",
          "MIXED_USE",
        ]).default("SINGLE_FAMILY"),
        purpose: z.string(),
        requestedType: z.enum([
          "AI_REPORT",
          "AI_REPORT_WITH_ONSITE",
          "CERTIFIED_APPRAISAL",
        ]),
        notes: z.string().optional(),
      })
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
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
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
          notes: input.notes ? `${input.notes}\n\nCheckout Session: ${checkoutSession.id}` : `Checkout Session: ${checkoutSession.id}`,
        },
      });

      return {
        appraisalId: appraisal.id,
        checkoutUrl: checkoutSession.url,
        price,
      };
    }),

  /**
   * Confirm payment and start processing
   * Called after successful Stripe redirect
   */
  confirmPayment: clientProcedure
    .input(z.object({ appraisalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.appraisalId },
        include: { property: true },
      });

      if (!appraisal) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (appraisal.organizationId !== ctx.organization!.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Only process if still in DRAFT status (not yet processed)
      if (appraisal.status !== "DRAFT") {
        return appraisal;
      }

      // Update to QUEUED status
      const updatedAppraisal = await ctx.prisma.appraisalRequest.update({
        where: { id: input.appraisalId },
        data: { status: "QUEUED" },
        include: { property: true, report: true },
      });

      // Create payment record
      await ctx.prisma.payment.create({
        data: {
          organizationId: ctx.organization!.id,
          userId: ctx.user.id,
          type: "CHARGE",
          amount: appraisal.price,
          description: `Appraisal for ${appraisal.property?.addressFull || "property"}`,
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });

      // Send payment confirmation and order confirmation emails
      if (ctx.user.email) {
        // Payment confirmation
        sendPaymentConfirmation({
          email: ctx.user.email,
          userName: ctx.user.firstName || "Customer",
          amount: Number(appraisal.price),
          description: `Appraisal for ${appraisal.property?.addressFull || "property"}`,
        }).catch((error) => {
          console.error("Failed to send payment confirmation email:", error);
        });

        // Order confirmation with details
        const estimatedDays = appraisal.requestedType === "AI_REPORT" ? 1 : 3;
        const estimatedDelivery = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000)
          .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

        sendAppraisalOrderConfirmation({
          email: ctx.user.email,
          userName: ctx.user.firstName || "Customer",
          propertyAddress: appraisal.property?.addressFull || "property",
          appraisalId: appraisal.id,
          reportType: appraisal.requestedType === "AI_REPORT" ? "AI Valuation Report" : "Certified Appraisal",
          estimatedDelivery,
          amount: Number(appraisal.price),
        }).catch((error) => {
          console.error("Failed to send order confirmation email:", error);
        });
      }

      // Process AI appraisals immediately
      if (appraisal.requestedType === "AI_REPORT") {
        processAppraisal(input.appraisalId).catch((error) => {
          console.error(`Failed to process appraisal ${input.appraisalId}:`, error);
        });
      }

      // For on-site appraisals, auto-create and dispatch a Job
      if (appraisal.requestedType === "AI_REPORT_WITH_ONSITE" ||
          appraisal.requestedType === "CERTIFIED_APPRAISAL") {

        // Configuration based on appraisal type
        const jobConfig = appraisal.requestedType === "AI_REPORT_WITH_ONSITE"
          ? { slaHours: 48, payout: 99, scope: "EXTERIOR_ONLY", jobType: "ONSITE_PHOTOS" as const }
          : { slaHours: 72, payout: 199, scope: "INTERIOR_EXTERIOR", jobType: "ONSITE_PHOTOS" as const };

        const slaDueAt = new Date(Date.now() + jobConfig.slaHours * 60 * 60 * 1000);

        // Create the job linked to this appraisal
        const job = await ctx.prisma.job.create({
          data: {
            organizationId: ctx.organization!.id,
            propertyId: appraisal.propertyId,
            appraisalRequestId: appraisal.id,
            jobType: jobConfig.jobType,
            scope: jobConfig.scope,
            payoutAmount: jobConfig.payout,
            slaDueAt,
            schedulingWindow: { flexible: true },
            status: "DISPATCHED",
            dispatchedAt: new Date(),
            statusHistory: [
              {
                status: "DISPATCHED",
                timestamp: new Date().toISOString(),
                userId: ctx.user.id,
                note: "Auto-created from appraisal order",
              },
            ],
          },
        });

        // Dispatch to available appraisers
        dispatchEngine.dispatch(job.id).catch((error) => {
          console.error(`Failed to dispatch job ${job.id}:`, error);
        });

        console.log(`Auto-created job ${job.id} for appraisal ${appraisal.id}`);
      }

      return updatedAppraisal;
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
