/**
 * Report Router
 * Handles report viewing and management
 */

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  clientProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const reportRouter = createTRPCRouter({
  /**
   * Get report by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.id },
        include: {
          appraisalRequest: {
            include: {
              property: true,
              organization: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      // Check access for clients
      if (
        ctx.user.role === "CLIENT" &&
        report.appraisalRequest?.organizationId !== ctx.organization?.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return report;
    }),

  /**
   * Get report by appraisal request ID
   */
  getByAppraisal: clientProcedure
    .input(z.object({ appraisalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.appraisalId },
        include: {
          report: true,
          property: true,
        },
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

      if (!appraisal.report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not yet generated",
        });
      }

      return {
        report: appraisal.report,
        property: appraisal.property,
      };
    }),

  /**
   * Get PDF download URL
   */
  download: clientProcedure
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: {
          appraisalRequest: true,
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      if (report.appraisalRequest?.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      if (!report.pdfUrl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "PDF not available",
        });
      }

      // TODO: Generate signed URL for secure download
      return {
        url: report.pdfUrl,
        expiresIn: 3600, // 1 hour
      };
    }),

  /**
   * Share report (generate share link)
   */
  share: clientProcedure
    .input(
      z.object({
        reportId: z.string(),
        expiresInDays: z.number().min(1).max(30).default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: {
          appraisalRequest: true,
        },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      if (report.appraisalRequest?.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // TODO: Generate share token and store
      const shareToken = generateShareToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      return {
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/shared/reports/${shareToken}`,
        expiresAt,
      };
    }),

  /**
   * Regenerate report (admin only or if failed)
   */
  regenerate: clientProcedure
    .input(z.object({ appraisalId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appraisal = await ctx.prisma.appraisalRequest.findUnique({
        where: { id: input.appraisalId },
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

      if (!["FAILED", "READY"].includes(appraisal.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot regenerate report in current status",
        });
      }

      // Reset status and queue regeneration
      await ctx.prisma.appraisalRequest.update({
        where: { id: input.appraisalId },
        data: {
          status: "QUEUED",
          statusMessage: "Regeneration requested",
        },
      });

      // TODO: Queue report regeneration job

      return { success: true, message: "Report regeneration queued" };
    }),
});

/**
 * Generate a random share token
 */
function generateShareToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
