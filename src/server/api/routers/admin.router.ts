/**
 * Admin Router
 * Platform administration and operations
 */

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createTransfer } from "@/shared/lib/stripe";

export const adminRouter = createTRPCRouter({
  /**
   * Dashboard stats
   */
  dashboard: createTRPCRouter({
    stats: adminProcedure.query(async ({ ctx }) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - 7);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalOrganizations,
        totalAppraisers,
        verifiedAppraisers,
        pendingVerifications,
        activeJobs,
        slaBreach,
        todayAppraisals,
        weeklyAppraisals,
        monthlyRevenue,
        openDisputes,
      ] = await Promise.all([
        ctx.prisma.organization.count(),
        ctx.prisma.appraiserProfile.count(),
        ctx.prisma.appraiserProfile.count({
          where: { verificationStatus: "VERIFIED" },
        }),
        ctx.prisma.appraiserProfile.count({
          where: { verificationStatus: "PENDING" },
        }),
        ctx.prisma.job.count({
          where: { status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] } },
        }),
        ctx.prisma.job.count({
          where: {
            status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
            slaDueAt: { lt: now },
          },
        }),
        ctx.prisma.appraisalRequest.count({
          where: { createdAt: { gte: today } },
        }),
        ctx.prisma.appraisalRequest.count({
          where: { createdAt: { gte: thisWeek } },
        }),
        ctx.prisma.payment.aggregate({
          where: {
            type: "CHARGE",
            status: "COMPLETED",
            createdAt: { gte: thisMonth },
          },
          _sum: { amount: true },
        }),
        ctx.prisma.dispute.count({
          where: { status: { in: ["OPEN", "UNDER_REVIEW", "ESCALATED"] } },
        }),
      ]);

      return {
        organizations: totalOrganizations,
        appraisers: {
          total: totalAppraisers,
          verified: verifiedAppraisers,
          pending: pendingVerifications,
        },
        jobs: {
          active: activeJobs,
          slaBreach,
        },
        appraisals: {
          today: todayAppraisals,
          thisWeek: weeklyAppraisals,
        },
        revenue: {
          thisMonth: Number(monthlyRevenue._sum.amount || 0),
        },
        disputes: openDisputes,
      };
    }),

    weeklyTrend: adminProcedure.query(async ({ ctx }) => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get jobs and payments from last 30 days
      const [jobs, payments] = await Promise.all([
        ctx.prisma.job.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true, status: true },
        }),
        ctx.prisma.payment.findMany({
          where: {
            type: "CHARGE",
            status: "COMPLETED",
            createdAt: { gte: thirtyDaysAgo },
          },
          select: { createdAt: true, amount: true },
        }),
      ]);

      // Group by day of week
      const dayData: Record<string, { jobs: number; revenue: number }> = {
        Mon: { jobs: 0, revenue: 0 },
        Tue: { jobs: 0, revenue: 0 },
        Wed: { jobs: 0, revenue: 0 },
        Thu: { jobs: 0, revenue: 0 },
        Fri: { jobs: 0, revenue: 0 },
        Sat: { jobs: 0, revenue: 0 },
        Sun: { jobs: 0, revenue: 0 },
      };

      jobs.forEach((job) => {
        const dayName = days[new Date(job.createdAt).getDay()];
        dayData[dayName].jobs += 1;
      });

      payments.forEach((payment) => {
        const dayName = days[new Date(payment.createdAt).getDay()];
        dayData[dayName].revenue += Number(payment.amount);
      });

      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
        name: day,
        jobs: dayData[day].jobs,
        revenue: Math.round(dayData[day].revenue),
      }));
    }),

    jobTypeDistribution: adminProcedure.query(async ({ ctx }) => {
      const [aiOnly, onSite, certified] = await Promise.all([
        ctx.prisma.appraisalRequest.count({
          where: { requestedType: "AI_REPORT" },
        }),
        ctx.prisma.appraisalRequest.count({
          where: { requestedType: "AI_REPORT_WITH_ONSITE" },
        }),
        ctx.prisma.appraisalRequest.count({
          where: { requestedType: "CERTIFIED_APPRAISAL" },
        }),
      ]);

      return [
        { name: "AI Only", value: aiOnly },
        { name: "On-Site", value: onSite },
        { name: "Certified", value: certified },
      ];
    }),

    recentActivity: adminProcedure.query(async ({ ctx }) => {
      const [recentAppraisals, recentJobs, recentDisputes] = await Promise.all([
        ctx.prisma.appraisalRequest.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            organization: { select: { name: true } },
            property: { select: { addressFull: true } },
          },
        }),
        ctx.prisma.job.findMany({
          take: 10,
          orderBy: { updatedAt: "desc" },
          include: {
            property: { select: { addressFull: true } },
            assignedAppraiser: {
              select: { firstName: true, lastName: true },
            },
          },
        }),
        ctx.prisma.dispute.findMany({
          take: 5,
          where: { status: { in: ["OPEN", "ESCALATED"] } },
          orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
          include: {
            organization: { select: { name: true } },
          },
        }),
      ]);

      return { recentAppraisals, recentJobs, recentDisputes };
    }),
  }),

  /**
   * Appraiser management
   */
  appraisers: createTRPCRouter({
    list: adminProcedure
      .input(
        z.object({
          status: z
            .enum(["PENDING", "VERIFIED", "EXPIRED", "REVOKED"])
            .optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const profiles = await ctx.prisma.appraiserProfile.findMany({
          where: input.status
            ? { verificationStatus: input.status }
            : undefined,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { userId: input.cursor }, skip: 1 }),
        });

        let nextCursor: string | undefined;
        if (profiles.length > input.limit) {
          const nextItem = profiles.pop();
          nextCursor = nextItem?.userId;
        }

        return { items: profiles, nextCursor };
      }),

    getById: adminProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ ctx, input }) => {
        const profile = await ctx.prisma.appraiserProfile.findUnique({
          where: { userId: input.userId },
          include: {
            user: true,
          },
        });

        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const recentJobs = await ctx.prisma.job.findMany({
          where: { assignedAppraiserId: input.userId },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { property: true },
        });

        const stats = await ctx.prisma.job.groupBy({
          by: ["status"],
          where: { assignedAppraiserId: input.userId },
          _count: true,
        });

        return { profile, recentJobs, stats };
      }),

    suspend: adminProcedure
      .input(
        z.object({
          userId: z.string(),
          reason: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.user.update({
          where: { id: input.userId },
          data: { status: "SUSPENDED" },
        });

        await ctx.prisma.appraiserProfile.update({
          where: { userId: input.userId },
          data: {
            verificationStatus: "REVOKED",
            verificationNotes: input.reason,
          },
        });

        // Cancel any active jobs
        await ctx.prisma.job.updateMany({
          where: {
            assignedAppraiserId: input.userId,
            status: { in: ["ACCEPTED", "IN_PROGRESS"] },
          },
          data: {
            status: "PENDING_DISPATCH",
            assignedAppraiserId: null,
          },
        });

        return { success: true };
      }),

    reactivate: adminProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.user.update({
          where: { id: input.userId },
          data: { status: "ACTIVE" },
        });

        await ctx.prisma.appraiserProfile.update({
          where: { userId: input.userId },
          data: { verificationStatus: "VERIFIED" },
        });

        return { success: true };
      }),
  }),

  /**
   * Organization management
   */
  organizations: createTRPCRouter({
    list: adminProcedure
      .input(
        z.object({
          plan: z
            .enum(["FREE_TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"])
            .optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const orgs = await ctx.prisma.organization.findMany({
          where: input.plan ? { plan: input.plan } : undefined,
          include: {
            _count: {
              select: { users: true, appraisalRequests: true, jobs: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        });

        let nextCursor: string | undefined;
        if (orgs.length > input.limit) {
          const nextItem = orgs.pop();
          nextCursor = nextItem?.id;
        }

        return { items: orgs, nextCursor };
      }),

    getById: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const org = await ctx.prisma.organization.findUnique({
          where: { id: input.id },
          include: {
            users: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                lastLoginAt: true,
              },
            },
            _count: {
              select: { appraisalRequests: true, jobs: true, payments: true },
            },
          },
        });

        if (!org) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const recentAppraisals = await ctx.prisma.appraisalRequest.findMany({
          where: { organizationId: input.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { property: true },
        });

        // Get payment history
        const payments = await ctx.prisma.payment.findMany({
          where: { organizationId: input.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        // Calculate stats
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [thisMonthRequests, lastMonthRequests] = await Promise.all([
          ctx.prisma.appraisalRequest.count({
            where: { organizationId: input.id, createdAt: { gte: thisMonth } },
          }),
          ctx.prisma.appraisalRequest.count({
            where: {
              organizationId: input.id,
              createdAt: { gte: lastMonth, lt: thisMonth },
            },
          }),
        ]);

        const growthPercent =
          lastMonthRequests > 0
            ? Math.round(
                ((thisMonthRequests - lastMonthRequests) / lastMonthRequests) *
                  100,
              )
            : thisMonthRequests > 0
              ? 100
              : 0;

        return {
          org,
          recentAppraisals,
          payments,
          stats: { thisMonthRequests, lastMonthRequests, growthPercent },
        };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          billingEmail: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          seats: z.number().min(1).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.organization.update({
          where: { id },
          data,
        });
      }),

    updatePlan: adminProcedure
      .input(
        z.object({
          id: z.string(),
          plan: z.enum(["FREE_TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"]),
          seats: z.number().min(1).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, plan, seats } = input;

        // Update the organization plan
        const org = await ctx.prisma.organization.update({
          where: { id },
          data: {
            plan,
            ...(seats && { seats }),
            // Reset trial end date if moving away from trial
            ...(plan !== "FREE_TRIAL" && { trialEndsAt: null }),
          },
        });

        // Create audit log
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.user.id,
            action: "update",
            resource: "organization",
            resourceId: id,
            newData: { plan, seats },
            metadata: { type: "plan_change" },
          },
        });

        return org;
      }),

    suspend: adminProcedure
      .input(
        z.object({
          id: z.string(),
          reason: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Suspend all users in the organization
        await ctx.prisma.user.updateMany({
          where: { organizationId: input.id },
          data: { status: "SUSPENDED" },
        });

        // Cancel any active jobs
        await ctx.prisma.job.updateMany({
          where: {
            organizationId: input.id,
            status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
          },
          data: { status: "CANCELLED" },
        });

        // Create audit log
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.user.id,
            action: "suspend",
            resource: "organization",
            resourceId: input.id,
            metadata: { reason: input.reason },
          },
        });

        return { success: true };
      }),

    reactivate: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Reactivate all users in the organization
        await ctx.prisma.user.updateMany({
          where: { organizationId: input.id },
          data: { status: "ACTIVE" },
        });

        // Create audit log
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.user.id,
            action: "reactivate",
            resource: "organization",
            resourceId: input.id,
          },
        });

        return { success: true };
      }),
  }),

  /**
   * Job management
   */
  jobs: createTRPCRouter({
    list: adminProcedure
      .input(
        z.object({
          status: z
            .enum([
              "PENDING_DISPATCH",
              "DISPATCHED",
              "ACCEPTED",
              "IN_PROGRESS",
              "SUBMITTED",
              "UNDER_REVIEW",
              "COMPLETED",
              "CANCELLED",
              "FAILED",
            ])
            .optional(),
          slaBreach: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const now = new Date();
        const jobs = await ctx.prisma.job.findMany({
          where: {
            ...(input.status && { status: input.status }),
            ...(input.slaBreach && {
              status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
              slaDueAt: { lt: now },
            }),
          },
          include: {
            property: {
              select: { addressFull: true, city: true, county: true },
            },
            organization: { select: { name: true } },
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

    getById: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.id },
          include: {
            property: true,
            organization: true,
            assignedAppraiser: {
              include: { appraiserProfile: true },
            },
            evidence: true,
            appraisalRequest: { include: { report: true } },
          },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return job;
      }),

    cancel: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          reason: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.job.update({
          where: { id: input.jobId },
          data: {
            status: "CANCELLED",
            statusHistory: {
              push: {
                status: "CANCELLED",
                timestamp: new Date().toISOString(),
                adminId: ctx.user.id,
                reason: input.reason,
              },
            },
          },
        });
      }),

    /**
     * Start review of a submitted job
     */
    startReview: adminProcedure
      .input(z.object({ jobId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.jobId },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        if (job.status !== "SUBMITTED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Job must be in SUBMITTED status to start review",
          });
        }

        return ctx.prisma.job.update({
          where: { id: input.jobId },
          data: {
            status: "UNDER_REVIEW",
            statusHistory: {
              push: {
                status: "UNDER_REVIEW",
                timestamp: new Date().toISOString(),
                adminId: ctx.user.id,
              },
            },
          },
        });
      }),

    /**
     * Approve a job and mark as completed
     */
    approve: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.jobId },
          include: { assignedAppraiser: true },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        if (!["SUBMITTED", "UNDER_REVIEW"].includes(job.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Job must be in SUBMITTED or UNDER_REVIEW status to approve",
          });
        }

        // Update job to completed
        const updatedJob = await ctx.prisma.job.update({
          where: { id: input.jobId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            statusHistory: {
              push: {
                status: "COMPLETED",
                timestamp: new Date().toISOString(),
                adminId: ctx.user.id,
                notes: input.notes,
              },
            },
          },
        });

        // Create payment record for appraiser
        if (job.assignedAppraiserId && job.payoutAmount) {
          await ctx.prisma.payment.create({
            data: {
              userId: job.assignedAppraiserId,
              relatedJobId: job.id,
              amount: job.payoutAmount,
              type: "JOB_PAYOUT",
              status: "PENDING",
              description: `Payout for job at ${job.propertyId}`,
            },
          });
        }

        return updatedJob;
      }),

    /**
     * Reject a job
     */
    reject: adminProcedure
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
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        if (!["SUBMITTED", "UNDER_REVIEW"].includes(job.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Job must be in SUBMITTED or UNDER_REVIEW status to reject",
          });
        }

        return ctx.prisma.job.update({
          where: { id: input.jobId },
          data: {
            status: "FAILED",
            statusHistory: {
              push: {
                status: "FAILED",
                timestamp: new Date().toISOString(),
                adminId: ctx.user.id,
                reason: input.reason,
              },
            },
          },
        });
      }),

    /**
     * Request revision - send back to appraiser
     */
    requestRevision: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          reason: z.string(),
          requiredPhotos: z.array(z.string()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.jobId },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        if (!["SUBMITTED", "UNDER_REVIEW"].includes(job.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Job must be in SUBMITTED or UNDER_REVIEW status",
          });
        }

        return ctx.prisma.job.update({
          where: { id: input.jobId },
          data: {
            status: "IN_PROGRESS",
            revisionRequested: true,
            revisionNotes: input.reason,
            statusHistory: {
              push: {
                status: "REVISION_REQUESTED",
                timestamp: new Date().toISOString(),
                adminId: ctx.user.id,
                reason: input.reason,
                requiredPhotos: input.requiredPhotos,
              },
            },
          },
        });
      }),

    /**
     * Reassign job to different appraiser
     */
    reassign: adminProcedure
      .input(
        z.object({
          jobId: z.string(),
          appraiserId: z.string().nullable(),
          reason: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.jobId },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        if (["COMPLETED", "CANCELLED", "FAILED"].includes(job.status)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot reassign completed, cancelled, or failed jobs",
          });
        }

        // If assigning to new appraiser, verify they exist and are verified
        if (input.appraiserId) {
          const appraiser = await ctx.prisma.appraiserProfile.findUnique({
            where: { userId: input.appraiserId },
          });

          if (!appraiser) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Appraiser not found",
            });
          }

          if (appraiser.verificationStatus !== "VERIFIED") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Appraiser must be verified",
            });
          }
        }

        return ctx.prisma.job.update({
          where: { id: input.jobId },
          data: {
            assignedAppraiserId: input.appraiserId,
            status: input.appraiserId ? "ACCEPTED" : "DISPATCHED",
            acceptedAt: input.appraiserId ? new Date() : null,
            startedAt: null,
            statusHistory: {
              push: {
                status: input.appraiserId ? "REASSIGNED" : "UNASSIGNED",
                timestamp: new Date().toISOString(),
                adminId: ctx.user.id,
                reason: input.reason,
                previousAppraiserId: job.assignedAppraiserId,
                newAppraiserId: input.appraiserId,
              },
            },
          },
        });
      }),

    /**
     * Get list of available appraisers for reassignment
     */
    getAvailableAppraisers: adminProcedure
      .input(z.object({ jobId: z.string() }))
      .query(async ({ ctx, input }) => {
        const job = await ctx.prisma.job.findUnique({
          where: { id: input.jobId },
          include: { property: true },
        });

        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        // Get verified appraisers
        const appraisers = await ctx.prisma.appraiserProfile.findMany({
          where: {
            verificationStatus: "VERIFIED",
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
        });

        return appraisers.map((a) => ({
          id: a.userId,
          name: `${a.user.firstName} ${a.user.lastName}`,
          email: a.user.email,
          coverageRadius: a.coverageRadiusMiles,
        }));
      }),

    /**
     * Bulk cancel jobs
     */
    bulkCancel: adminProcedure
      .input(
        z.object({
          jobIds: z.array(z.string()),
          reason: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const result = await ctx.prisma.job.updateMany({
          where: {
            id: { in: input.jobIds },
            status: { notIn: ["COMPLETED", "CANCELLED", "FAILED"] },
          },
          data: {
            status: "CANCELLED",
          },
        });

        // Add to status history for each job
        for (const jobId of input.jobIds) {
          await ctx.prisma.job
            .update({
              where: { id: jobId },
              data: {
                statusHistory: {
                  push: {
                    status: "CANCELLED",
                    timestamp: new Date().toISOString(),
                    adminId: ctx.user.id,
                    reason: input.reason,
                    bulkOperation: true,
                  },
                },
              },
            })
            .catch(() => {}); // Ignore errors for already completed/cancelled jobs
        }

        return {
          success: true,
          cancelledCount: result.count,
        };
      }),

    /**
     * Bulk approve jobs
     */
    bulkApprove: adminProcedure
      .input(
        z.object({
          jobIds: z.array(z.string()),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const jobs = await ctx.prisma.job.findMany({
          where: {
            id: { in: input.jobIds },
            status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
          },
        });

        let approvedCount = 0;
        for (const job of jobs) {
          await ctx.prisma.job.update({
            where: { id: job.id },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
              statusHistory: {
                push: {
                  status: "COMPLETED",
                  timestamp: new Date().toISOString(),
                  adminId: ctx.user.id,
                  notes: input.notes,
                  bulkOperation: true,
                },
              },
            },
          });

          // Create payment record
          if (job.assignedAppraiserId && job.payoutAmount) {
            await ctx.prisma.payment.create({
              data: {
                userId: job.assignedAppraiserId,
                relatedJobId: job.id,
                amount: job.payoutAmount,
                type: "JOB_PAYOUT",
                status: "PENDING",
                description: `Payout for job ${job.id}`,
              },
            });
          }

          approvedCount++;
        }

        return {
          success: true,
          approvedCount,
        };
      }),

    /**
     * Check SLA breaches and get stats
     */
    getSLAStats: adminProcedure.query(async ({ ctx }) => {
      const now = new Date();

      const [pendingDispatch, dispatched, active, breached] = await Promise.all(
        [
          ctx.prisma.job.count({ where: { status: "PENDING_DISPATCH" } }),
          ctx.prisma.job.count({ where: { status: "DISPATCHED" } }),
          ctx.prisma.job.count({
            where: {
              status: {
                in: ["ACCEPTED", "IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW"],
              },
            },
          }),
          ctx.prisma.job.count({
            where: {
              status: {
                in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"],
              },
              slaDueAt: { lt: now },
            },
          }),
        ],
      );

      // Get breached jobs
      const breachedJobs = await ctx.prisma.job.findMany({
        where: {
          status: {
            in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS", "SUBMITTED"],
          },
          slaDueAt: { lt: now },
        },
        include: {
          property: { select: { addressFull: true, city: true } },
          assignedAppraiser: { select: { firstName: true, lastName: true } },
        },
        orderBy: { slaDueAt: "asc" },
        take: 10,
      });

      return {
        pendingDispatch,
        dispatched,
        active,
        breached,
        breachedJobs: breachedJobs.map((j) => ({
          id: j.id,
          address: j.property?.addressFull,
          city: j.property?.city,
          appraiser: j.assignedAppraiser
            ? `${j.assignedAppraiser.firstName} ${j.assignedAppraiser.lastName}`
            : null,
          status: j.status,
          slaDueAt: j.slaDueAt,
          hoursOverdue: j.slaDueAt
            ? Math.round(
                ((now.getTime() - j.slaDueAt.getTime()) / (1000 * 60 * 60)) *
                  10,
              ) / 10
            : 0,
        })),
      };
    }),

    /**
     * Get job counts by status
     */
    getStatusCounts: adminProcedure.query(async ({ ctx }) => {
      const counts = await ctx.prisma.job.groupBy({
        by: ["status"],
        _count: { id: true },
      });

      return counts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        },
        {} as Record<string, number>,
      );
    }),
  }),

  /**
   * Pricing rules management
   */
  pricing: createTRPCRouter({
    list: adminProcedure.query(async ({ ctx }) => {
      return ctx.prisma.pricingRule.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
    }),

    create: adminProcedure
      .input(
        z.object({
          ruleType: z.string(),
          propertyType: z
            .enum([
              "SINGLE_FAMILY",
              "MULTI_FAMILY",
              "CONDO",
              "TOWNHOUSE",
              "COMMERCIAL",
              "LAND",
              "MIXED_USE",
            ])
            .optional(),
          jobType: z.enum(["ONSITE_PHOTOS", "CERTIFIED_APPRAISAL"]).optional(),
          county: z.string().optional(),
          basePrice: z.number().optional(),
          multiplier: z.number().optional(),
          platformFeePercent: z.number().optional(),
          appraiserPayoutPercent: z.number().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.pricingRule.create({
          data: input,
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.string(),
          ruleType: z.string().optional(),
          basePrice: z.number().optional(),
          multiplier: z.number().optional(),
          platformFeePercent: z.number().optional(),
          appraiserPayoutPercent: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return ctx.prisma.pricingRule.update({
          where: { id },
          data,
        });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.pricingRule.update({
          where: { id: input.id },
          data: { isActive: false },
        });
      }),

    // Update product price - creates or updates a base_price rule
    updateProductPrice: adminProcedure
      .input(
        z.object({
          productId: z.string(),
          basePrice: z.number().min(0),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Find existing rule or create new one
        const existing = await ctx.prisma.pricingRule.findFirst({
          where: {
            ruleType: `product_${input.productId}`,
            isActive: true,
          },
        });

        if (existing) {
          return ctx.prisma.pricingRule.update({
            where: { id: existing.id },
            data: { basePrice: input.basePrice },
          });
        }

        return ctx.prisma.pricingRule.create({
          data: {
            ruleType: `product_${input.productId}`,
            basePrice: input.basePrice,
          },
        });
      }),

    // Get payout configuration
    getPayoutConfig: adminProcedure.query(async ({ ctx }) => {
      const config = await ctx.prisma.systemConfig.findUnique({
        where: { key: "payout_config" },
      });

      const defaultConfig = {
        schedule: "weekly" as const,
        minAmount: 50,
        paymentMethod: "stripe_connect" as const,
      };

      if (!config) {
        return defaultConfig;
      }

      const value = config.value as {
        schedule?: string;
        minAmount?: number;
        paymentMethod?: string;
      };

      return {
        schedule:
          (value.schedule as "weekly" | "biweekly" | "monthly") ||
          defaultConfig.schedule,
        minAmount: value.minAmount ?? defaultConfig.minAmount,
        paymentMethod:
          (value.paymentMethod as "stripe_connect" | "ach") ||
          defaultConfig.paymentMethod,
      };
    }),

    // Save payout configuration
    savePayoutConfig: adminProcedure
      .input(
        z.object({
          schedule: z.enum(["weekly", "biweekly", "monthly"]),
          minAmount: z.number().min(0),
          paymentMethod: z.enum(["stripe_connect", "ach"]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.systemConfig.upsert({
          where: { key: "payout_config" },
          update: {
            value: {
              schedule: input.schedule,
              minAmount: input.minAmount,
              paymentMethod: input.paymentMethod,
            },
          },
          create: {
            key: "payout_config",
            value: {
              schedule: input.schedule,
              minAmount: input.minAmount,
              paymentMethod: input.paymentMethod,
            },
            description: "Payout schedule and settings configuration",
          },
        });
      }),

    // Update payout rate for a job type
    updatePayoutRate: adminProcedure
      .input(
        z.object({
          id: z.string(),
          basePayout: z.number().min(0).optional(),
          percentage: z.number().min(0).max(100).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.pricingRule.update({
          where: { id: input.id },
          data: {
            ...(input.basePayout !== undefined && {
              basePrice: input.basePayout,
            }),
            ...(input.percentage !== undefined && {
              appraiserPayoutPercent: input.percentage,
            }),
          },
        });
      }),

    // Get payout summary for processing
    payoutSummary: adminProcedure.query(async ({ ctx }) => {
      const pendingPayouts = await ctx.prisma.payment.findMany({
        where: {
          type: "PAYOUT",
          status: "PENDING",
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              appraiserProfile: {
                select: { stripeConnectId: true },
              },
            },
          },
        },
      });

      const totalPending = pendingPayouts.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      const appraiserCount = new Set(pendingPayouts.map((p) => p.userId)).size;

      // Get next monday as payout date
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));

      return {
        totalPending,
        appraiserCount,
        nextPayoutDate: nextMonday,
        avgPayout:
          appraiserCount > 0 ? Math.round(totalPending / appraiserCount) : 0,
        pendingPayouts,
      };
    }),

    // Process payouts to appraisers
    processPayouts: adminProcedure
      .input(
        z.object({
          appraiserIds: z.array(z.string()).optional(), // If empty, process all
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const whereClause: {
          type: "PAYOUT";
          status: "PENDING";
          userId?: { in: string[] };
        } = {
          type: "PAYOUT",
          status: "PENDING",
        };

        if (input.appraiserIds && input.appraiserIds.length > 0) {
          whereClause.userId = { in: input.appraiserIds };
        }

        // Get all pending payouts
        const pendingPayouts = await ctx.prisma.payment.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                appraiserProfile: {
                  select: { stripeConnectId: true, payoutEnabled: true },
                },
              },
            },
          },
        });

        // Group by appraiser for batch processing
        const payoutsByAppraiser = new Map<string, typeof pendingPayouts>();
        for (const payout of pendingPayouts) {
          if (!payout.userId) continue;
          const existing = payoutsByAppraiser.get(payout.userId) || [];
          existing.push(payout);
          payoutsByAppraiser.set(payout.userId, existing);
        }

        const results: Array<{
          appraiserId: string;
          success: boolean;
          error?: string;
          amount?: number;
          paymentCount?: number;
        }> = [];

        // Process each appraiser's payouts
        for (const [appraiserId, payouts] of payoutsByAppraiser) {
          const appraiser = payouts[0]?.user;

          // Check if payout is enabled
          if (!appraiser?.appraiserProfile?.payoutEnabled) {
            results.push({
              appraiserId,
              success: false,
              error: "Payout not enabled for this appraiser",
            });
            continue;
          }

          // Mark all payouts as processing
          await ctx.prisma.payment.updateMany({
            where: { id: { in: payouts.map((p) => p.id) } },
            data: { status: "PROCESSING" },
          });

          const totalAmount = payouts.reduce(
            (sum, p) => sum + Number(p.amount),
            0,
          );
          const stripeConnectId = appraiser.appraiserProfile?.stripeConnectId;

          // Check if appraiser has Stripe Connect account
          if (!stripeConnectId) {
            await ctx.prisma.payment.updateMany({
              where: { id: { in: payouts.map((p) => p.id) } },
              data: {
                status: "PENDING",
                statusMessage: "Stripe Connect not configured",
              },
            });
            results.push({
              appraiserId,
              success: false,
              error: "Stripe Connect account not configured",
            });
            continue;
          }

          try {
            // Create Stripe transfer to appraiser's Connect account
            const transfer = await createTransfer({
              amount: totalAmount,
              destinationAccountId: stripeConnectId,
              description: `Payout for ${payouts.length} completed jobs`,
              metadata: {
                appraiserId,
                paymentIds: payouts.map((p) => p.id).join(","),
              },
            });

            // Update payments with transfer ID and mark as completed
            await ctx.prisma.payment.updateMany({
              where: { id: { in: payouts.map((p) => p.id) } },
              data: {
                status: "COMPLETED",
                processedAt: new Date(),
                stripeTransferId: transfer.id,
              },
            });

            results.push({
              appraiserId,
              success: true,
              amount: totalAmount,
              paymentCount: payouts.length,
            });
          } catch (stripeError) {
            // Rollback to pending on Stripe failure
            await ctx.prisma.payment.updateMany({
              where: { id: { in: payouts.map((p) => p.id) } },
              data: {
                status: "FAILED",
                statusMessage:
                  stripeError instanceof Error
                    ? stripeError.message
                    : "Stripe transfer failed",
              },
            });
            results.push({
              appraiserId,
              success: false,
              error:
                stripeError instanceof Error
                  ? stripeError.message
                  : "Stripe transfer failed",
            });
          }
        }

        // Create audit log
        await ctx.prisma.auditLog.create({
          data: {
            userId: ctx.user.id,
            action: "process_payouts",
            resource: "payment",
            metadata: {
              totalProcessed: results.filter((r) => r.success).length,
              totalAmount: results.reduce(
                (sum, r) => sum + (r.success ? (r.amount ?? 0) : 0),
                0,
              ),
            },
          },
        });

        return {
          success: true,
          processed: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
          results,
        };
      }),
  }),

  /**
   * Feature flags
   */
  featureFlags: createTRPCRouter({
    list: adminProcedure.query(async ({ ctx }) => {
      return ctx.prisma.featureFlag.findMany({
        orderBy: { name: "asc" },
      });
    }),

    toggle: adminProcedure
      .input(
        z.object({
          name: z.string(),
          enabled: z.boolean(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.featureFlag.upsert({
          where: { name: input.name },
          update: { isEnabled: input.enabled },
          create: { name: input.name, isEnabled: input.enabled },
        });
      }),
  }),

  /**
   * Audit logs
   */
  auditLogs: adminProcedure
    .input(
      z.object({
        resource: z.string().optional(),
        userId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.prisma.auditLog.findMany({
        where: {
          ...(input.resource && { resource: input.resource }),
          ...(input.userId && { userId: input.userId }),
        },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor && { cursor: { id: input.cursor }, skip: 1 }),
      });

      let nextCursor: string | undefined;
      if (logs.length > input.limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id;
      }

      return { items: logs, nextCursor };
    }),
});
