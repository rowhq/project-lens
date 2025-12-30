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
