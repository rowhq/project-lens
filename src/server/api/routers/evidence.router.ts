/**
 * Evidence Router
 * Handles evidence upload and management for jobs with S3/R2 integration
 */

import { z } from "zod";
import { createTRPCRouter, appraiserProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import * as storage from "@/shared/lib/storage";
import { calculateDistanceMiles } from "@/shared/lib/geo";
import { Errors } from "@/shared/lib/errors";

export const evidenceRouter = createTRPCRouter({
  /**
   * Get presigned upload URL for evidence
   */
  getUploadUrl: appraiserProcedure
    .input(
      z.object({
        jobId: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number().max(50 * 1024 * 1024), // Max 50MB
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify job is assigned to this appraiser
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (job.assignedAppraiserId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your job" });
      }

      if (!["IN_PROGRESS", "ACCEPTED"].includes(job.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job must be in progress to upload evidence",
        });
      }

      // Validate file type
      if (!storage.isValidEvidenceType(input.fileType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.",
        });
      }

      // Generate unique file key
      const fileKey = storage.generateEvidenceKey({
        jobId: input.jobId,
        category: input.category || "general",
        filename: input.fileName,
      });

      try {
        const result = await storage.getUploadUrl({
          key: fileKey,
          contentType: input.fileType,
          expiresIn: 3600, // 1 hour
        });

        return {
          uploadUrl: result.uploadUrl,
          publicUrl: result.publicUrl,
          fileKey: result.key,
          expiresAt: result.expiresAt,
        };
      } catch (error) {
        console.error("Error generating upload URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),

  /**
   * Confirm evidence upload completed
   */
  confirm: appraiserProcedure
    .input(
      z.object({
        jobId: z.string(),
        fileKey: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        mediaType: z.enum(["PHOTO", "VIDEO", "DOCUMENT", "FLOOR_PLAN", "AUDIO"]),
        category: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        capturedAt: z.string(),
        exifData: z.record(z.string(), z.any()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job || job.assignedAppraiserId !== ctx.user.id) {
        throw Errors.forbidden("Not your job");
      }

      // Validate timestamp - photo should not be older than job start or in the future
      const capturedAt = new Date(input.capturedAt);
      const now = new Date();
      const maxAgeHours = 72; // Allow photos up to 72 hours old
      const oldestAllowed = new Date(now.getTime() - maxAgeHours * 60 * 60 * 1000);

      let timestampSuspicious = false;
      let locationSuspicious = false;

      // Check if timestamp is suspicious
      if (capturedAt > now) {
        timestampSuspicious = true; // Future timestamp
      } else if (capturedAt < oldestAllowed) {
        timestampSuspicious = true; // Too old
      } else if (job.startedAt && capturedAt < job.startedAt) {
        timestampSuspicious = true; // Before job started
      }

      // Validate geolocation if provided
      if (input.latitude && input.longitude && job.property.latitude && job.property.longitude) {
        const distanceFromProperty = calculateDistanceMiles(
          input.latitude,
          input.longitude,
          job.property.latitude,
          job.property.longitude
        );
        // Flag if photo taken more than 0.5 miles from property
        if (distanceFromProperty > 0.5) {
          locationSuspicious = true;
        }
      }

      // Generate integrity hash
      const integrityHash = crypto
        .createHash("sha256")
        .update(`${input.fileKey}-${input.fileSize}-${input.capturedAt}`)
        .digest("hex");

      // Get the public URL for the file
      const fileUrl = storage.getPublicUrl(input.fileKey);

      // Build metadata for suspicious flags
      const metadata = {
        ...(input.exifData || {}),
        _flags: {
          timestampSuspicious,
          locationSuspicious,
          distanceFromPropertyMiles: input.latitude && input.longitude && job.property.latitude && job.property.longitude
            ? calculateDistanceMiles(input.latitude, input.longitude, job.property.latitude, job.property.longitude)
            : null,
        },
      };

      const evidence = await ctx.prisma.evidence.create({
        data: {
          jobId: input.jobId,
          mediaType: input.mediaType,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          fileUrl,
          category: input.category,
          latitude: input.latitude,
          longitude: input.longitude,
          capturedAt,
          exifData: metadata,
          integrityHash,
          notes: input.notes,
          // Mark as unverified if suspicious
          verified: !timestampSuspicious && !locationSuspicious,
        },
      });

      // Update job evidence count
      await ctx.prisma.job.update({
        where: { id: input.jobId },
        data: {
          updatedAt: new Date(),
        },
      });

      return evidence;
    }),

  /**
   * List evidence for a job
   */
  list: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
        include: { evidence: { orderBy: { uploadedAt: "asc" } } },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check access
      const isAssigned = job.assignedAppraiserId === ctx.user.id;
      const isOrgMember = job.organizationId === ctx.organization?.id;
      const isAdmin = ctx.user.role === "ADMIN" || ctx.user.role === "SUPER_ADMIN";

      if (!isAssigned && !isOrgMember && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return job.evidence;
    }),

  /**
   * Get evidence counts by category for a job
   */
  counts: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const counts = await ctx.prisma.evidence.groupBy({
        by: ["category"],
        where: { jobId: input.jobId },
        _count: { id: true },
      });

      const total = await ctx.prisma.evidence.count({
        where: { jobId: input.jobId },
      });

      return {
        total,
        byCategory: counts.reduce(
          (acc, c) => {
            acc[c.category || "uncategorized"] = c._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
      };
    }),

  /**
   * Delete evidence (before job submission)
   */
  delete: appraiserProcedure
    .input(z.object({ evidenceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const evidence = await ctx.prisma.evidence.findUnique({
        where: { id: input.evidenceId },
        include: { job: true },
      });

      if (!evidence) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (evidence.job.assignedAppraiserId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (evidence.job.status === "SUBMITTED" || evidence.job.status === "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete evidence after submission",
        });
      }

      // Delete from S3/R2
      try {
        const fileKey = storage.getKeyFromUrl(evidence.fileUrl);
        if (fileKey) {
          await storage.deleteFile(fileKey);
        }
      } catch (error) {
        console.error("Error deleting file from storage:", error);
        // Continue with database deletion even if storage delete fails
      }

      await ctx.prisma.evidence.delete({
        where: { id: input.evidenceId },
      });

      return { success: true };
    }),

  /**
   * Get signed download URL for evidence
   */
  getDownloadUrl: protectedProcedure
    .input(z.object({ evidenceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const evidence = await ctx.prisma.evidence.findUnique({
        where: { id: input.evidenceId },
        include: { job: true },
      });

      if (!evidence) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check access
      const isAssigned = evidence.job.assignedAppraiserId === ctx.user.id;
      const isOrgMember = evidence.job.organizationId === ctx.organization?.id;
      const isAdmin = ctx.user.role === "ADMIN" || ctx.user.role === "SUPER_ADMIN";

      if (!isAssigned && !isOrgMember && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        const fileKey = storage.getKeyFromUrl(evidence.fileUrl);
        if (!fileKey) {
          throw new Error("Invalid file URL");
        }

        const signedUrl = await storage.getDownloadUrl({
          key: fileKey,
          expiresIn: 3600, // 1 hour
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
   * Verify evidence integrity
   */
  verify: protectedProcedure
    .input(z.object({ evidenceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const evidence = await ctx.prisma.evidence.findUnique({
        where: { id: input.evidenceId },
      });

      if (!evidence) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        id: evidence.id,
        verified: evidence.verified,
        integrityHash: evidence.integrityHash,
        hasGeotag: !!evidence.latitude && !!evidence.longitude,
        hasExif: !!evidence.exifData,
        capturedAt: evidence.capturedAt,
        geolocation: evidence.latitude && evidence.longitude
          ? { latitude: evidence.latitude, longitude: evidence.longitude }
          : null,
      };
    }),

  /**
   * Mark evidence as verified (admin only)
   */
  markVerified: protectedProcedure
    .input(z.object({ evidenceId: z.string(), verified: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "ADMIN" && ctx.user.role !== "SUPER_ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const evidence = await ctx.prisma.evidence.update({
        where: { id: input.evidenceId },
        data: { verified: input.verified },
      });

      return evidence;
    }),
});
