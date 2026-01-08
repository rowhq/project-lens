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
  protectedProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import { Prisma, JobStatus, JobType } from "@prisma/client";
import { calculateDistanceMiles as calculateDistance } from "@/shared/lib/geo";
import { Errors } from "@/shared/lib/errors";
import { dispatchEngine } from "@/server/services/dispatch-engine";

/**
 * Valid job status transitions
 * Maps current status to allowed next statuses
 */
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  PENDING_DISPATCH: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "COMPLETED", "FAILED"],
  UNDER_REVIEW: ["COMPLETED", "FAILED"],
  COMPLETED: [], // Terminal state
  FAILED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Validate a status transition is allowed
 */
function validateTransition(current: JobStatus, next: JobStatus): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw Errors.invalidTransition(current, next);
  }
}

export const jobRouter = createTRPCRouter({
  /**
   * List jobs for organization (client view)
   */
  listForOrganization: clientProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        status: z.string().optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const jobs = await ctx.prisma.job.findMany({
        where: {
          organizationId: ctx.organization!.id,
          ...(input.status && { status: input.status as JobStatus }),
        },
        include: {
          property: true,
          assignedAppraiser: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
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
   * Get job details for client
   */
  getForClient: clientProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.id },
        include: {
          property: true,
          assignedAppraiser: {
            select: { firstName: true, lastName: true },
          },
          evidence: {
            orderBy: { uploadedAt: "asc" },
          },
        },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (job.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return job;
    }),

  /**
   * Create a new order (job) for on-site inspection
   */
  createOrder: clientProcedure
    .input(
      z.object({
        address: z.string(),
        city: z.string(),
        state: z.string().default("TX"),
        zipCode: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        scopePreset: z.enum([
          "EXTERIOR_ONLY",
          "INTERIOR_EXTERIOR",
          "COMPREHENSIVE",
          "FULL_CERTIFIED",
          "RUSH_INSPECTION",
        ]),
        scheduledDate: z.date().optional(),
        scheduledTime: z.string().optional(),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
        accessNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create property
      let property = await ctx.prisma.property.findFirst({
        where: {
          addressLine1: input.address,
          city: input.city,
          state: input.state,
        },
      });

      if (!property) {
        property = await ctx.prisma.property.create({
          data: {
            addressLine1: input.address,
            addressFull: `${input.address}, ${input.city}, ${input.state} ${input.zipCode}`,
            city: input.city,
            county: "", // Will be determined by geocoding
            state: input.state,
            zipCode: input.zipCode,
            latitude: input.latitude,
            longitude: input.longitude,
            propertyType: "SINGLE_FAMILY", // Default
          },
        });
      }

      // Calculate SLA and pricing based on scope
      const scopeConfig: Record<string, { slaHours: number; payout: number }> =
        {
          EXTERIOR_ONLY: { slaHours: 48, payout: 99 },
          INTERIOR_EXTERIOR: { slaHours: 72, payout: 199 },
          COMPREHENSIVE: { slaHours: 120, payout: 349 },
          FULL_CERTIFIED: { slaHours: 168, payout: 549 },
          RUSH_INSPECTION: { slaHours: 24, payout: 299 },
        };

      const config = scopeConfig[input.scopePreset];
      const slaDueAt = new Date(Date.now() + config.slaHours * 60 * 60 * 1000);

      // Create the job in PENDING_DISPATCH status
      const job = await ctx.prisma.job.create({
        data: {
          organizationId: ctx.organization!.id,
          propertyId: property.id,
          jobType: "ONSITE_PHOTOS",
          scope: input.scopePreset, // Store the preset name in scope field
          payoutAmount: config.payout,
          slaDueAt,
          schedulingWindow: input.scheduledDate
            ? {
                date: input.scheduledDate.toISOString(),
                time: input.scheduledTime,
              }
            : { flexible: true },
          accessContact:
            input.contactName || input.contactPhone
              ? { name: input.contactName, phone: input.contactPhone }
              : Prisma.DbNull,
          specialInstructions: input.accessNotes,
          status: "PENDING_DISPATCH",
          statusHistory: [
            {
              status: "PENDING_DISPATCH",
              timestamp: new Date().toISOString(),
              userId: ctx.user.id,
            },
          ],
        },
        include: {
          property: true,
        },
      });

      // Dispatch job to available appraisers
      const dispatchResult = await dispatchEngine.dispatch(job.id, {
        urgency: input.scopePreset === "RUSH_INSPECTION" ? "URGENT" : "NORMAL",
      });

      // Handle dispatch failure
      if (!dispatchResult.success) {
        // Log the failure for monitoring
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.user.id,
            resource: "JOB",
            resourceId: job.id,
            action: "DISPATCH_FAILED",
            metadata: {
              message: dispatchResult.message,
              matchedAppraisers: dispatchResult.matchedAppraisers.length,
            },
          },
        });

        // Update job status to reflect dispatch issue if no appraisers found
        if (dispatchResult.matchedAppraisers.length === 0) {
          await ctx.prisma.job.update({
            where: { id: job.id },
            data: {
              statusHistory: {
                push: {
                  status: "NO_APPRAISERS_AVAILABLE",
                  timestamp: new Date().toISOString(),
                  message: dispatchResult.message,
                },
              },
            },
          });
        }
      }

      // Fetch updated job with dispatch status
      const updatedJob = await ctx.prisma.job.findUnique({
        where: { id: job.id },
        include: { property: true },
      });

      return {
        ...updatedJob!,
        dispatchResult: {
          success: dispatchResult.success,
          matchedAppraisers: dispatchResult.matchedAppraisers.length,
          message: dispatchResult.message,
        },
      };
    }),

  /**
   * Get available jobs for appraiser (within radius)
   */
  available: appraiserProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        maxDistance: z.number().optional(),
        minPayout: z.number().optional(),
        jobType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { appraiserProfile } = ctx;

      // Get jobs within appraiser's coverage radius
      // TODO: Implement proper geospatial query with PostGIS
      const jobs = await ctx.prisma.job.findMany({
        where: {
          status: "DISPATCHED",
          assignedAppraiserId: null,
          // Apply minPayout filter at DB level
          ...(input.minPayout && {
            payoutAmount: { gte: input.minPayout },
          }),
          // Apply jobType filter at DB level
          ...(input.jobType && {
            jobType: input.jobType as JobType,
          }),
        },
        include: {
          property: true,
          organization: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        // Fetch more to account for distance filtering, then limit
        take: input.limit * 3,
      });

      // Type for jobs with property included
      type JobWithProperty = (typeof jobs)[0];

      // Get skipped jobs with cooldown (24 hours)
      const skippedJobs =
        (appraiserProfile.skippedJobs as Record<string, string>) || {};
      const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();

      // Determine the effective max distance
      const effectiveMaxDistance =
        input.maxDistance ?? appraiserProfile.coverageRadiusMiles;

      // Filter by distance and exclude recently skipped jobs
      const filtered = jobs.filter((job) => {
        // Check if job was skipped recently
        const skippedAt = skippedJobs[job.id];
        if (skippedAt) {
          const skippedTime = new Date(skippedAt).getTime();
          if (now - skippedTime < cooldownMs) {
            return false; // Still in cooldown
          }
        }

        const distance = calculateDistance(
          appraiserProfile.homeBaseLat,
          appraiserProfile.homeBaseLng,
          job.property.latitude,
          job.property.longitude,
        );

        // Apply distance filter
        return distance <= effectiveMaxDistance;
      });

      // Map with distance and apply final limit
      return filtered.slice(0, input.limit).map((job) => ({
        ...job,
        distance: calculateDistance(
          appraiserProfile.homeBaseLat,
          appraiserProfile.homeBaseLng,
          job.property.latitude,
          job.property.longitude,
        ),
      }));
    }),

  /**
   * Skip a job (won't see it for 24 hours)
   */
  skip: appraiserProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { appraiserProfile } = ctx;

      // Verify job exists and is available
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job not found",
        });
      }

      if (job.status !== "DISPATCHED" || job.assignedAppraiserId !== null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Job is not available to skip",
        });
      }

      // Add to skipped jobs
      const skippedJobs =
        (appraiserProfile.skippedJobs as Record<string, string>) || {};
      skippedJobs[input.jobId] = new Date().toISOString();

      // Optimized cleanup: Only run when object is large or probabilistically
      // This avoids O(n) cleanup on every single skip operation
      const entryCount = Object.keys(skippedJobs).length;
      const shouldCleanup = entryCount > 50 || Math.random() < 0.1; // 10% chance or > 50 entries

      if (shouldCleanup) {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const entries = Object.entries(skippedJobs);
        let cleanedCount = 0;

        for (const [jobId, timestamp] of entries) {
          if (new Date(timestamp).getTime() < weekAgo) {
            delete skippedJobs[jobId];
            cleanedCount++;
          }
        }

        if (cleanedCount > 0) {
          console.log(
            `[SkippedJobs] Cleaned ${cleanedCount} old entries for user ${ctx.user.id}`,
          );
        }
      }

      await ctx.prisma.appraiserProfile.update({
        where: { userId: ctx.user.id },
        data: { skippedJobs },
      });

      return { success: true };
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
      if (job.assignedAppraiserId && job.assignedAppraiserId !== ctx.user.id) {
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
        throw Errors.notFound("Job");
      }

      // Validate transition
      validateTransition(job.status, "ACCEPTED");

      if (job.assignedAppraiserId) {
        throw Errors.badRequest("Job is already assigned");
      }

      // Verify appraiser is verified
      if (ctx.appraiserProfile.verificationStatus !== "VERIFIED") {
        throw Errors.forbidden("Appraiser verification required");
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
        include: { property: true },
      });

      if (!job) {
        throw Errors.notFound("Job");
      }

      if (job.assignedAppraiserId !== ctx.user.id) {
        throw Errors.forbidden("Job not assigned to you");
      }

      // Validate transition
      validateTransition(job.status, "IN_PROGRESS");

      // Verify geofence - ENFORCE location requirement
      const distance = calculateDistance(
        input.latitude,
        input.longitude,
        job.property.latitude,
        job.property.longitude,
      );
      const distanceMeters = distance * 1609.34; // miles to meters
      const geofenceVerified = distanceMeters <= job.geofenceRadius;

      // Block start if outside geofence
      if (!geofenceVerified) {
        const distanceFeet = Math.round(distanceMeters * 3.28084);
        const requiredFeet = Math.round(job.geofenceRadius * 3.28084);
        throw Errors.preconditionFailed(
          `You must be within ${requiredFeet} feet of the property to start this job. ` +
            `Current distance: ${distanceFeet} feet.`,
        );
      }

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
        include: { evidence: true },
      });

      if (!job) {
        throw Errors.notFound("Job");
      }

      if (job.assignedAppraiserId !== ctx.user.id) {
        throw Errors.forbidden("Job not assigned to you");
      }

      // Validate transition
      validateTransition(job.status, "SUBMITTED");

      // Validate minimum evidence
      if (job.evidence.length < 5) {
        throw Errors.badRequest("Minimum 5 photos required");
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
        startDate: z.string().optional(), // ISO date string
        endDate: z.string().optional(), // ISO date string
      }),
    )
    .query(async ({ ctx, input }) => {
      const jobs = await ctx.prisma.job.findMany({
        where: {
          assignedAppraiserId: ctx.user.id,
          status: {
            in: ["COMPLETED", "CANCELLED"],
          },
          // Date range filter
          ...(input.startDate || input.endDate
            ? {
                completedAt: {
                  ...(input.startDate && { gte: new Date(input.startDate) }),
                  ...(input.endDate && {
                    lte: new Date(input.endDate + "T23:59:59.999Z"),
                  }),
                },
              }
            : {}),
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
   * Cancel job (client view)
   * Only jobs in DISPATCHED status can be cancelled by clients
   */
  cancelForClient: clientProcedure
    .input(
      z.object({
        jobId: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      // Verify organization ownership
      if (job.organizationId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      // Only allow cancellation of DISPATCHED jobs (not yet accepted by an appraiser)
      if (job.status !== "DISPATCHED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only orders awaiting appraiser assignment can be cancelled",
        });
      }

      return ctx.prisma.job.update({
        where: { id: input.jobId },
        data: {
          status: "CANCELLED",
          statusHistory: {
            push: {
              status: "CANCELLED",
              timestamp: new Date().toISOString(),
              userId: ctx.user.id,
              reason: input.reason || "Cancelled by client",
            },
          },
        },
      });
    }),

  /**
   * Appraiser: Cancel accepted job
   * Only allowed before starting inspection
   */
  cancelByAppraiser: appraiserProcedure
    .input(
      z.object({
        jobId: z.string(),
        reason: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) {
        throw Errors.notFound("Job");
      }

      if (job.assignedAppraiserId !== ctx.user.id) {
        throw Errors.forbidden("Job not assigned to you");
      }

      // Only allow cancellation of ACCEPTED jobs (not yet started)
      if (job.status !== "ACCEPTED") {
        throw Errors.badRequest(
          "Only accepted jobs can be cancelled. Jobs in progress must be completed or contact admin.",
        );
      }

      // Update job back to dispatched
      return ctx.prisma.job.update({
        where: { id: input.jobId },
        data: {
          assignedAppraiserId: null,
          status: "DISPATCHED",
          acceptedAt: null,
          statusHistory: {
            push: {
              status: "CANCELLED_BY_APPRAISER",
              timestamp: new Date().toISOString(),
              userId: ctx.user.id,
              reason: input.reason,
            },
          },
        },
      });
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
      }),
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
