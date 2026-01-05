/**
 * Report Router
 * Handles report viewing, downloading, and sharing with secure access
 */

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  clientProcedure,
  publicProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import * as storage from "@/shared/lib/storage";
import { sendReportEmail } from "@/shared/lib/resend";
import { processAppraisal } from "@/server/services/appraisal-processor";
import { reportGenerator } from "@/server/services/report-generator";

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
   * Get HTML content for client-side PDF generation
   * Used when server-side PDF generation is not available (Vercel serverless)
   */
  getHtmlContent: clientProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: {
          appraisalRequest: {
            select: {
              organizationId: true,
              referenceCode: true,
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

      if (report.appraisalRequest?.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      if (!report.htmlContent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report HTML content not available",
        });
      }

      return {
        htmlContent: report.htmlContent,
        referenceCode:
          report.appraisalRequest?.referenceCode || `report-${report.id}`,
      };
    }),

  /**
   * Get PDF download URL with signed access
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

      // Use getDownloadUrl which generates PDF on-demand if missing
      try {
        const pdfUrl = await reportGenerator.getDownloadUrl(input.reportId);

        // Generate signed URL for secure download
        const fileKey = storage.getKeyFromUrl(pdfUrl);
        if (!fileKey) {
          // If not in our storage, return the URL directly
          return {
            url: pdfUrl,
            expiresIn: 3600,
          };
        }

        const signedUrl = await storage.getDownloadUrl({
          key: fileKey,
          expiresIn: 3600, // 1 hour
        });

        return {
          url: signedUrl,
          expiresIn: 3600,
        };
      } catch (error) {
        console.error("Error generating download URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `PDF generation failed: ${error.message}`
              : "Failed to generate download URL",
        });
      }
    }),

  /**
   * Share report (generate secure share link)
   */
  share: clientProcedure
    .input(
      z.object({
        reportId: z.string(),
        expiresInDays: z.number().min(1).max(30).default(7),
        allowDownload: z.boolean().default(true),
        password: z.string().optional(),
        maxViews: z.number().min(1).max(1000).optional(),
      }),
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

      // Generate secure share token
      const shareToken = generateShareToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      // Hash password if provided
      const passwordHash = input.password
        ? crypto.createHash("sha256").update(input.password).digest("hex")
        : null;

      // Create share link in database
      const shareLink = await ctx.prisma.shareLink.create({
        data: {
          token: shareToken,
          resourceType: "report",
          resourceId: input.reportId,
          createdById: ctx.user.id,
          organizationId: ctx.organization!.id,
          allowDownload: input.allowDownload,
          password: passwordHash,
          maxViews: input.maxViews,
          expiresAt,
        },
      });

      return {
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`,
        token: shareToken,
        expiresAt,
        allowDownload: input.allowDownload,
        hasPassword: !!input.password,
        maxViews: input.maxViews,
      };
    }),

  /**
   * Get shared report (public access with token)
   */
  getShared: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const shareLink = await ctx.prisma.shareLink.findUnique({
        where: { token: input.token },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share link not found",
        });
      }

      // Check if expired
      if (shareLink.expiresAt < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Share link has expired",
        });
      }

      // Check if revoked
      if (shareLink.revokedAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Share link has been revoked",
        });
      }

      // Check max views
      if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Share link view limit reached",
        });
      }

      // Check password if required
      if (shareLink.password) {
        if (!input.password) {
          return {
            requiresPassword: true,
            report: null,
            property: null,
          };
        }

        const passwordHash = crypto
          .createHash("sha256")
          .update(input.password)
          .digest("hex");

        if (passwordHash !== shareLink.password) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Incorrect password",
          });
        }
      }

      // Get the report
      const report = await ctx.prisma.report.findUnique({
        where: { id: shareLink.resourceId },
        include: {
          appraisalRequest: {
            include: {
              property: true,
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

      // Increment view count
      await ctx.prisma.shareLink.update({
        where: { id: shareLink.id },
        data: { viewCount: { increment: 1 } },
      });

      return {
        requiresPassword: false,
        report: {
          id: report.id,
          type: report.type,
          valueEstimate: report.valueEstimate,
          valueRangeMin: report.valueRangeMin,
          valueRangeMax: report.valueRangeMax,
          confidenceScore: report.confidenceScore,
          comps: report.comps,
          compsCount: report.compsCount,
          aiAnalysis: report.aiAnalysis,
          generatedAt: report.generatedAt,
        },
        property: report.appraisalRequest?.property,
        allowDownload: shareLink.allowDownload,
      };
    }),

  /**
   * Download shared report PDF
   */
  downloadShared: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const shareLink = await ctx.prisma.shareLink.findUnique({
        where: { token: input.token },
      });

      if (!shareLink) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Share link not found",
        });
      }

      // All the same checks as getShared
      if (shareLink.expiresAt < new Date() || shareLink.revokedAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Share link is no longer valid",
        });
      }

      if (!shareLink.allowDownload) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Download not allowed for this share link",
        });
      }

      if (shareLink.password) {
        if (!input.password) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Password required",
          });
        }

        const passwordHash = crypto
          .createHash("sha256")
          .update(input.password)
          .digest("hex");

        if (passwordHash !== shareLink.password) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Incorrect password",
          });
        }
      }

      const report = await ctx.prisma.report.findUnique({
        where: { id: shareLink.resourceId },
      });

      if (!report?.pdfUrl) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "PDF not available",
        });
      }

      try {
        const fileKey = storage.getKeyFromUrl(report.pdfUrl);
        if (!fileKey) {
          return { url: report.pdfUrl };
        }

        const signedUrl = await storage.getDownloadUrl({
          key: fileKey,
          expiresIn: 3600,
        });

        return { url: signedUrl };
      } catch (error) {
        console.error("Error generating download URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate download URL",
        });
      }
    }),

  /**
   * List share links for a report
   */
  listShareLinks: clientProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: { appraisalRequest: true },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (report.appraisalRequest?.organizationId !== ctx.organization!.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const shareLinks = await ctx.prisma.shareLink.findMany({
        where: {
          resourceType: "report",
          resourceId: input.reportId,
          revokedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      return shareLinks.map((link) => ({
        id: link.id,
        token: link.token,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/share/${link.token}`,
        expiresAt: link.expiresAt,
        isExpired: link.expiresAt < new Date(),
        allowDownload: link.allowDownload,
        hasPassword: !!link.password,
        maxViews: link.maxViews,
        viewCount: link.viewCount,
        createdAt: link.createdAt,
      }));
    }),

  /**
   * Revoke a share link
   */
  revokeShareLink: clientProcedure
    .input(z.object({ shareLinkId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const shareLink = await ctx.prisma.shareLink.findUnique({
        where: { id: input.shareLinkId },
      });

      if (!shareLink) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (shareLink.organizationId !== ctx.organization!.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.prisma.shareLink.update({
        where: { id: input.shareLinkId },
        data: { revokedAt: new Date() },
      });

      return { success: true };
    }),

  /**
   * Get existing share link for a report
   */
  getShareLink: clientProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: { appraisalRequest: true },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      if (report.appraisalRequest?.organizationId !== ctx.organization!.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Find the most recent active share link
      const shareLink = await ctx.prisma.shareLink.findFirst({
        where: {
          resourceType: "report",
          resourceId: input.reportId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!shareLink) {
        return null;
      }

      return {
        id: shareLink.id,
        token: shareLink.token,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareLink.token}`,
        expiresAt: shareLink.expiresAt,
        allowDownload: shareLink.allowDownload,
        hasPassword: !!shareLink.password,
        maxViews: shareLink.maxViews,
        viewCount: shareLink.viewCount,
        createdAt: shareLink.createdAt,
      };
    }),

  /**
   * Email report to a recipient
   */
  emailReport: clientProcedure
    .input(
      z.object({
        reportId: z.string(),
        recipientEmail: z.string().email(),
        message: z.string().optional(),
        includeDownloadLink: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: {
          appraisalRequest: {
            include: {
              property: true,
              organization: { select: { name: true } },
            },
          },
        },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      if (report.appraisalRequest?.organizationId !== ctx.organization!.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const property = report.appraisalRequest?.property;
      if (!property) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Property not found for this report",
        });
      }

      // Check for existing valid share link before creating a new one
      const existingShareLink = await ctx.prisma.shareLink.findFirst({
        where: {
          resourceType: "report",
          resourceId: input.reportId,
          expiresAt: { gt: new Date() },
          // Only reuse if download permission matches
          allowDownload: input.includeDownloadLink,
        },
        orderBy: { expiresAt: "desc" },
      });

      let shareToken: string;

      if (existingShareLink) {
        // Reuse existing share link
        shareToken = existingShareLink.token;
      } else {
        // Create a new share link (7 days, with download if requested)
        shareToken = generateShareToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await ctx.prisma.shareLink.create({
          data: {
            token: shareToken,
            resourceType: "report",
            resourceId: input.reportId,
            createdById: ctx.user.id,
            organizationId: ctx.organization!.id,
            allowDownload: input.includeDownloadLink,
            expiresAt,
          },
        });
      }

      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;

      // Send the email
      try {
        const result = await sendReportEmail({
          recipientEmail: input.recipientEmail,
          senderName: `${ctx.user.firstName} ${ctx.user.lastName}`,
          organizationName:
            report.appraisalRequest?.organization?.name || "TruPlat",
          propertyAddress: property.addressFull,
          reportType: report.type.replace("_", " "),
          valueEstimate: Number(report.valueEstimate),
          shareUrl,
          message: input.message,
          allowDownload: input.includeDownloadLink,
        });

        return {
          success: true,
          emailId: result.id,
          shareUrl,
        };
      } catch (error) {
        console.error("Failed to send report email:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email. Please try again.",
        });
      }
    }),

  /**
   * Regenerate report (if failed or update needed)
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

      // Process synchronously (required for Vercel serverless)
      try {
        await processAppraisal(input.appraisalId);
      } catch (error) {
        console.error(
          `Failed to regenerate report for ${input.appraisalId}:`,
          error,
        );
        // Don't throw - cron will retry if needed
      }

      return { success: true, message: "Report regeneration completed" };
    }),
});

/**
 * Generate a cryptographically secure share token
 */
function generateShareToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}
