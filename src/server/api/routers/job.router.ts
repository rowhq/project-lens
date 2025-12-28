/**
 * Job Router
 * Handles on-site and certified appraisal jobs
 */

import { z } from "zod";
import {
  createTRPCRouter,
  clientProcedure,
  appraiserProcedure,
  adminProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const jobRouter = createTRPCRouter({
  /**
   * Get available jobs for appraiser (within radius)
   */
  available: appraiserProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { appraiserProfile } = ctx;

      // Get jobs within appraiser's coverage radius
      // TODO: Implement proper geospatial query with PostGIS
      const jobs = await ctx.prisma.job.findMany({
        where: {
          status: "DISPATCHED",
          assignedAppraiserId: null,
        },
        include: {
          property: true,
          organization: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      // Filter by distance (simplified - should use PostGIS)
      const filtered = jobs.filter((job) => {
        const distance = calculateDistance(
          appraiserProfile.homeBaseLat,
          appraiserProfile.homeBaseLng,
          job.property.latitude,
          job.property.longitude
        );
        return distance <= appraiserProfile.coverageRadiusMiles;
      });

      return filtered.map((job) => ({
        ...job,
        distance: calculateDistance(
          appraiserProfile.homeBaseLat,
          appraiserProfile.homeBaseLng,
          job.property.latitude,
          job.property.longitude
        ),
      }));
    }),

  /**
   * Get job by ID
   */
  getById: appraiserProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.id },
        include: {
          property: true,
          organization: { select: { name: true } },
          evidence: true,
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      // Appraiser can only view jobs assigned to them or available
      if (
        job.assignedAppraiserId &&
        job.assignedAppraiserId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return job;
    }),

  /**
   * Accept a job
   */
  accept: appraiserProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.status !== "DISPATCHED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job is not available for acceptance",
        });
      }

      if (job.assignedAppraiserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job is already assigned",
        });
      }

      // Verify appraiser is verified
      if (ctx.appraiserProfile.verificationStatus !== "VERIFIED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Appraiser verification required",
        });
      }

      return ctx.prisma.job.update({
        where: { id: input.jobId },
        data: {
          assignedAppraiserId: ctx.user.id,
          status: "ACCEPTED",
          acceptedAt: new Date(),
          statusHistory: {
            push: {
              status: "ACCEPTED",
              timestamp: new Date().toISOString(),
              userId: ctx.user.id,
            },
          },
        },
        include: {
          property: true,
        },
      });
    }),

  /**
   * Start job (on-site)
   */
  start: appraiserProcedure
    .input(
      z.object({
        jobId: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.assignedAppraiserId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Job not assigned to you",
        });
      }

      if (job.status !== "ACCEPTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job must be accepted before starting",
        });
      }

      // Verify geofence
      const distance = calculateDistance(
        input.latitude,
        input.longitude,
        job.property.latitude,
        job.property.longitude
      );
      const distanceMeters = distance * 1609.34; // miles to meters
      const geofenceVerified = distanceMeters <= job.geofenceRadius;

      return ctx.prisma.job.update({
        where: { id: input.jobId },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
          geofenceVerified,
          statusHistory: {
            push: {
              status: "IN_PROGRESS",
              timestamp: new Date().toISOString(),
              userId: ctx.user.id,
              geofenceVerified,
            },
          },
        },
      });
    }),

  /**
   * Submit completed job
   */
  submit: appraiserProcedure
    .input(
      z.object({
        jobId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
        include: { evidence: true },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.assignedAppraiserId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Job not assigned to you",
        });
      }

      if (job.status !== "IN_PROGRESS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job must be in progress to submit",
        });
      }

      // Validate minimum evidence
      if (job.evidence.length < 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Minimum 5 photos required",
        });
      }

      return ctx.prisma.job.update({
        where: { id: input.jobId },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          specialInstructions: input.notes
            ? `${job.specialInstructions || ""}\n\nAppraiser notes: ${input.notes}`
            : job.specialInstructions,
          statusHistory: {
            push: {
              status: "SUBMITTED",
              timestamp: new Date().toISOString(),
              userId: ctx.user.id,
              evidenceCount: job.evidence.length,
            },
          },
        },
      });
    }),

  /**
   * Get appraiser's active jobs
   */
  myActive: appraiserProcedure.query(async ({ ctx }) => {
    return ctx.prisma.job.findMany({
      where: {
        assignedAppraiserId: ctx.user.id,
        status: {
          in: ["ACCEPTED", "IN_PROGRESS"],
        },
      },
      include: {
        property: true,
        organization: { select: { name: true } },
      },
      orderBy: { slaDueAt: "asc" },
    });
  }),

  /**
   * Get appraiser's job history
   */
  history: appraiserProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const jobs = await ctx.prisma.job.findMany({
        where: {
          assignedAppraiserId: ctx.user.id,
          status: {
            in: ["COMPLETED", "CANCELLED"],
          },
        },
        include: {
          property: true,
        },
        orderBy: { completedAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (jobs.length > input.limit) {
        const nextItem = jobs.pop();
        nextCursor = nextItem?.id;
      }

      return { items: jobs, nextCursor };
    }),

  /**
   * Admin: Reassign job
   */
  reassign: adminProcedure
    .input(
      z.object({
        jobId: z.string(),
        appraiserId: z.string().optional(), // null to unassign
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      return ctx.prisma.job.update({
        where: { id: input.jobId },
        data: {
          assignedAppraiserId: input.appraiserId || null,
          status: input.appraiserId ? "ACCEPTED" : "DISPATCHED",
          statusHistory: {
            push: {
              status: input.appraiserId ? "REASSIGNED" : "UNASSIGNED",
              timestamp: new Date().toISOString(),
              adminId: ctx.user.id,
              reason: input.reason,
            },
          },
        },
      });
    }),
});

/**
 * Calculate distance between two points in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
