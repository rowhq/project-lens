/**
 * Dispute Router
 * Handles dispute creation, management, and resolution
 */

import { z } from "zod";
import {
  createTRPCRouter,
  clientProcedure,
  adminProcedure,
  protectedProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import { sendDisputeNotification } from "@/shared/lib/resend";
import * as stripe from "@/shared/lib/stripe";

export const disputeRouter = createTRPCRouter({
  /**
   * Create a new dispute
   */
  create: clientProcedure
    .input(
      z.object({
        category: z.enum([
          "VALUATION_ACCURACY",
          "SERVICE_QUALITY",
          "TIMELINESS",
          "PHOTO_QUALITY",
          "BILLING",
          "OTHER",
        ]),
        subject: z.string().min(1).max(200),
        description: z.string().min(10).max(5000),
        relatedJobId: z.string().optional(),
        relatedReportId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify related entities belong to organization
      if (input.relatedJobId) {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.relatedJobId },
        });
        if (!job || job.organizationId !== ctx.organization!.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }
      }

      if (input.relatedReportId) {
        const report = await ctx.prisma.report.findUnique({
          where: { id: input.relatedReportId },
          include: { appraisalRequest: true },
        });
        if (
          !report ||
          report.appraisalRequest?.organizationId !== ctx.organization!.id
        ) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
        }
      }

      const dispute = await ctx.prisma.dispute.create({
        data: {
          organizationId: ctx.organization!.id,
          category: input.category,
          subject: input.subject,
          description: input.description,
          relatedJobId: input.relatedJobId,
          relatedReportId: input.relatedReportId,
          status: "OPEN",
        },
      });

      // Get property address if available
      let propertyAddress = "N/A";
      if (input.relatedJobId) {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.relatedJobId },
          include: { property: true },
        });
        if (job?.property) {
          propertyAddress = job.property.addressFull;
        }
      }

      // Send notification to admin
      const adminEmail = process.env.ADMIN_EMAIL || "admin@truplat.com";
      try {
        await sendDisputeNotification({
          adminEmail,
          disputeId: dispute.id,
          reason: `${input.category}: ${input.subject}`,
          submitterName: `${ctx.user.firstName} ${ctx.user.lastName}`,
          propertyAddress,
        });
      } catch (error) {
        console.error("Failed to send dispute notification:", error);
      }

      return dispute;
    }),

  /**
   * Get dispute by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "ADMIN" || ctx.user.role === "SUPER_ADMIN";

      const dispute = await ctx.prisma.dispute.findUnique({
        where: { id: input.id },
        include: {
          organization: { select: { id: true, name: true } },
          relatedJob: {
            include: {
              property: true,
              assignedAppraiser: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          relatedReport: true,
          comments: {
            where: isAdmin ? {} : { isInternal: false },
            include: {
              author: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!dispute) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check access
      const isOrgMember = dispute.organizationId === ctx.organization?.id;

      if (!isOrgMember && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return dispute;
    }),

  /**
   * List disputes
   */
  list: clientProcedure
    .input(
      z.object({
        status: z
          .enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "ESCALATED", "CLOSED"])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const disputes = await ctx.prisma.dispute.findMany({
        where: {
          organizationId: ctx.organization!.id,
          ...(input.status && { status: input.status }),
        },
        include: {
          relatedJob: { select: { jobNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (disputes.length > input.limit) {
        const nextItem = disputes.pop();
        nextCursor = nextItem?.id;
      }

      return { items: disputes, nextCursor };
    }),

  /**
   * Add comment to dispute
   */
  addComment: protectedProcedure
    .input(
      z.object({
        disputeId: z.string(),
        content: z.string().min(1).max(2000),
        isInternal: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dispute = await ctx.prisma.dispute.findUnique({
        where: { id: input.disputeId },
      });

      if (!dispute) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check access
      const isOrgMember = dispute.organizationId === ctx.organization?.id;
      const isAdmin = ctx.user.role === "ADMIN" || ctx.user.role === "SUPER_ADMIN";

      if (!isOrgMember && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Only admins can create internal comments
      if (input.isInternal && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create internal comments",
        });
      }

      return ctx.prisma.disputeComment.create({
        data: {
          disputeId: input.disputeId,
          authorId: ctx.user.id,
          content: input.content,
          isInternal: input.isInternal,
        },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
          },
        },
      });
    }),

  /**
   * Get comments for a dispute
   */
  getComments: protectedProcedure
    .input(
      z.object({
        disputeId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dispute = await ctx.prisma.dispute.findUnique({
        where: { id: input.disputeId },
      });

      if (!dispute) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check access
      const isOrgMember = dispute.organizationId === ctx.organization?.id;
      const isAdmin = ctx.user.role === "ADMIN" || ctx.user.role === "SUPER_ADMIN";

      if (!isOrgMember && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Build where clause - non-admins can't see internal comments
      const whereClause: { disputeId: string; isInternal?: boolean } = {
        disputeId: input.disputeId,
      };
      if (!isAdmin) {
        whereClause.isInternal = false;
      }

      const comments = await ctx.prisma.disputeComment.findMany({
        where: whereClause,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (comments.length > input.limit) {
        const nextItem = comments.pop();
        nextCursor = nextItem?.id;
      }

      return { items: comments, nextCursor };
    }),

  /**
   * Resolve dispute (admin)
   */
  resolve: adminProcedure
    .input(
      z.object({
        disputeId: z.string(),
        resolution: z.string().min(1),
        refundAmount: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dispute = await ctx.prisma.dispute.findUnique({
        where: { id: input.disputeId },
        include: {
          relatedJob: true,
        },
      });

      if (!dispute) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Process refund if applicable
      if (input.refundAmount && input.refundAmount > 0) {
        // Find the original payment to refund
        let originalPayment: {
          id: string;
          stripePaymentIntentId: string | null;
        } | null = null;

        // Try to find payment by related job
        if (dispute.relatedJobId) {
          originalPayment = await ctx.prisma.payment.findFirst({
            where: {
              relatedJobId: dispute.relatedJobId,
              type: "CHARGE",
              status: "COMPLETED",
              stripePaymentIntentId: { not: null },
            },
            orderBy: { createdAt: "desc" },
            select: { id: true, stripePaymentIntentId: true },
          });
        }

        // If no job-related payment, try to find by organization
        if (!originalPayment) {
          originalPayment = await ctx.prisma.payment.findFirst({
            where: {
              organizationId: dispute.organizationId,
              type: "CHARGE",
              status: "COMPLETED",
              stripePaymentIntentId: { not: null },
            },
            orderBy: { createdAt: "desc" },
            select: { id: true, stripePaymentIntentId: true },
          });
        }

        // Process Stripe refund if we have a payment to refund
        let stripeRefundId: string | null = null;
        if (originalPayment && originalPayment.stripePaymentIntentId) {
          try {
            const refund = await stripe.createRefund({
              paymentIntentId: originalPayment.stripePaymentIntentId,
              amount: input.refundAmount,
              reason: "requested_by_customer",
            });
            stripeRefundId = refund.id;
          } catch (error) {
            console.error("Failed to process Stripe refund:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to process refund with payment provider",
            });
          }
        }

        // Create refund payment record
        await ctx.prisma.payment.create({
          data: {
            organizationId: dispute.organizationId,
            type: "REFUND",
            amount: -input.refundAmount, // Negative amount for refund
            description: `Refund for dispute ${dispute.id}`,
            status: stripeRefundId ? "COMPLETED" : "PENDING",
            stripePaymentIntentId: stripeRefundId,
            relatedJobId: dispute.relatedJobId,
          },
        });
      }

      return ctx.prisma.dispute.update({
        where: { id: input.disputeId },
        data: {
          status: "RESOLVED",
          resolution: input.resolution,
          refundAmount: input.refundAmount,
          resolvedAt: new Date(),
          assignedToId: ctx.user.id,
        },
      });
    }),

  /**
   * Escalate dispute
   */
  escalate: adminProcedure
    .input(
      z.object({
        disputeId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dispute.update({
        where: { id: input.disputeId },
        data: {
          status: "ESCALATED",
          priority: 1,
        },
      });
    }),

  /**
   * Close dispute
   */
  close: adminProcedure
    .input(z.object({ disputeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dispute.update({
        where: { id: input.disputeId },
        data: { status: "CLOSED" },
      });
    }),

  /**
   * Admin: List all disputes
   */
  listAll: adminProcedure
    .input(
      z.object({
        status: z
          .enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "ESCALATED", "CLOSED"])
          .optional(),
        priority: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const disputes = await ctx.prisma.dispute.findMany({
        where: {
          ...(input.status && { status: input.status }),
          ...(input.priority && { priority: input.priority }),
        },
        include: {
          organization: { select: { id: true, name: true } },
          relatedJob: { select: { jobNumber: true } },
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (disputes.length > input.limit) {
        const nextItem = disputes.pop();
        nextCursor = nextItem?.id;
      }

      return { items: disputes, nextCursor };
    }),
});
