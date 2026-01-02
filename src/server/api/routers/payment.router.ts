/**
 * Payment Router
 * Handles appraiser earnings and payouts
 */

import { z } from "zod";
import { createTRPCRouter, appraiserProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const paymentRouter = createTRPCRouter({
  /**
   * Get appraiser's earnings summary
   */
  getEarningsSummary: appraiserProcedure.query(async ({ ctx }) => {
    const payments = await ctx.prisma.payment.findMany({
      where: {
        userId: ctx.user.id,
        type: "JOB_PAYOUT",
      },
    });

    const pending = payments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const processing = payments
      .filter((p) => p.status === "PROCESSING")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const completed = payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Get this week's earnings
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const thisWeek = payments
      .filter((p) => new Date(p.createdAt) >= weekStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Get this month's earnings
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thisMonth = payments
      .filter((p) => new Date(p.createdAt) >= monthStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      pending,
      processing,
      completed,
      thisWeek,
      thisMonth,
      totalEarnings: pending + processing + completed,
      availableForPayout: pending,
    };
  }),

  /**
   * Get appraiser's payment history
   */
  getPaymentHistory: appraiserProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z
          .enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const payments = await ctx.prisma.payment.findMany({
        where: {
          userId: ctx.user.id,
          type: "JOB_PAYOUT",
          ...(input.status && { status: input.status }),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (payments.length > input.limit) {
        const nextItem = payments.pop();
        nextCursor = nextItem?.id;
      }

      return { items: payments, nextCursor };
    }),

  /**
   * Request payout (appraiser requests their pending earnings)
   */
  requestPayout: appraiserProcedure
    .input(
      z.object({
        paymentIds: z.array(z.string()).optional(), // Specific payments, or all pending if not provided
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get pending payments
      const whereClause = {
        userId: ctx.user.id,
        type: "JOB_PAYOUT" as const,
        status: "PENDING" as const,
        ...(input.paymentIds && { id: { in: input.paymentIds } }),
      };

      const pendingPayments = await ctx.prisma.payment.findMany({
        where: whereClause,
      });

      if (pendingPayments.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No pending payments to request",
        });
      }

      // Update all to processing
      await ctx.prisma.payment.updateMany({
        where: whereClause,
        data: {
          status: "PROCESSING",
        },
      });

      const totalAmount = pendingPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      return {
        success: true,
        paymentsProcessed: pendingPayments.length,
        totalAmount,
        message: `Payout request submitted for $${totalAmount.toFixed(2)}`,
      };
    }),

  /**
   * Admin: List all pending payouts
   */
  listPendingPayouts: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "PROCESSING"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const payments = await ctx.prisma.payment.findMany({
        where: {
          type: "JOB_PAYOUT",
          status: input.status || { in: ["PENDING", "PROCESSING"] },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (payments.length > input.limit) {
        const nextItem = payments.pop();
        nextCursor = nextItem?.id;
      }

      return { items: payments, nextCursor };
    }),

  /**
   * Admin: Process payout (mark as completed)
   */
  processPayout: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        stripeTransferId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input.paymentId },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      if (!["PENDING", "PROCESSING"].includes(payment.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment is not in a processable state",
        });
      }

      return ctx.prisma.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          stripeTransferId: input.stripeTransferId,
        },
      });
    }),

  /**
   * Admin: Bulk process payouts
   */
  bulkProcessPayouts: adminProcedure
    .input(
      z.object({
        paymentIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.payment.updateMany({
        where: {
          id: { in: input.paymentIds },
          status: { in: ["PENDING", "PROCESSING"] },
        },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });

      return {
        success: true,
        processedCount: result.count,
      };
    }),

  /**
   * Admin: Fail a payout
   */
  failPayout: adminProcedure
    .input(
      z.object({
        paymentId: z.string(),
        reason: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.payment.update({
        where: { id: input.paymentId },
        data: {
          status: "FAILED",
          statusMessage: input.reason,
        },
      });
    }),
});
