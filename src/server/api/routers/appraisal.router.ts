/**
 * Appraisal Router
 * Handles appraisal request operations
 */

import { z } from "zod";
import {
  createTRPCRouter,
  clientProcedure,
  protectedProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const appraisalRouter = createTRPCRouter({
  /**
   * Create a new appraisal request
   */
  create: clientProcedure
    .input(
      z.object({
        propertyId: z.string(),
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
      // Verify property exists
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.propertyId },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      // Calculate price (placeholder - will be implemented with pricing rules)
      const price = 99.0; // Base AI report price

      // Create appraisal request
      const appraisal = await ctx.prisma.appraisalRequest.create({
        data: {
          organizationId: ctx.organization!.id,
          requestedById: ctx.user.id,
          propertyId: input.propertyId,
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

      // TODO: Queue appraisal processing job

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
});
