/**
 * Admin Router
 * Platform administration and operations
 */

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createTransfer } from "@/shared/lib/stripe";

// Helper to calculate date range
function getDateRangeStart(
  range: "7d" | "30d" | "90d" | "ytd" | undefined,
): Date {
  const now = new Date();
  if (!range || range === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return start;
  }
  if (range === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start;
  }
  if (range === "90d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 90);
    return start;
  }
  // YTD - start of current year
  return new Date(now.getFullYear(), 0, 1);
}

const dateRangeSchema = z.object({
  dateRange: z.enum(["7d", "30d", "90d", "ytd"]).optional(),
});

export const adminRouter = createTRPCRouter({
  /**
   * Dashboard stats
   */
  dashboard: createTRPCRouter({
    stats: adminProcedure
      .input(dateRangeSchema.optional())
      .query(async ({ ctx, input }) => {
        const rangeStart = getDateRangeStart(input?.dateRange);
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        const [
          totalOrganizations,
          totalAppraisers,
          verifiedAppraisers,
          pendingVerifications,
          activeJobs,
          slaBreach,
          periodAppraisals,
          completedJobsInRange,
          periodRevenue,
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
            where: {
              status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
            },
          }),
          ctx.prisma.job.count({
            where: {
              status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
              slaDueAt: { lt: now },
            },
          }),
          ctx.prisma.appraisalRequest.count({
            where: { createdAt: { gte: rangeStart } },
          }),
          ctx.prisma.job.count({
            where: {
              status: "COMPLETED",
              completedAt: { gte: rangeStart },
            },
          }),
          ctx.prisma.payment.aggregate({
            where: {
              type: "CHARGE",
              status: "COMPLETED",
              createdAt: { gte: rangeStart },
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
            completed: completedJobsInRange,
            slaBreach,
          },
          appraisals: {
            period: periodAppraisals,
          },
          revenue: {
            period: Number(periodRevenue._sum.amount || 0),
          },
          disputes: openDisputes,
        };
      }),

    weeklyTrend: adminProcedure
      .input(dateRangeSchema.optional())
      .query(async ({ ctx, input }) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const rangeStart = getDateRangeStart(input?.dateRange);

        // Get jobs and payments within the selected date range
        const [jobs, payments] = await Promise.all([
          ctx.prisma.job.findMany({
            where: { createdAt: { gte: rangeStart } },
            select: { createdAt: true, status: true },
          }),
          ctx.prisma.payment.findMany({
            where: {
              type: "CHARGE",
              status: "COMPLETED",
              createdAt: { gte: rangeStart },
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

    jobTypeDistribution: adminProcedure
      .input(dateRangeSchema.optional())
      .query(async ({ ctx, input }) => {
        const rangeStart = getDateRangeStart(input?.dateRange);
        const [aiOnly, onSite, certified] = await Promise.all([
          ctx.prisma.appraisalRequest.count({
            where: {
              requestedType: "AI_REPORT",
              createdAt: { gte: rangeStart },
            },
          }),
          ctx.prisma.appraisalRequest.count({
            where: {
              requestedType: "AI_REPORT_WITH_ONSITE",
              createdAt: { gte: rangeStart },
            },
          }),
          ctx.prisma.appraisalRequest.count({
            where: {
              requestedType: "CERTIFIED_APPRAISAL",
              createdAt: { gte: rangeStart },
            },
          }),
        ]);

        return [
          { name: "AI Report", value: aiOnly },
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

    /**
     * Top performing appraisers
     */
    topAppraisers: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
      .query(async ({ ctx, input }) => {
        const appraisers = await ctx.prisma.appraiserProfile.findMany({
          where: { verificationStatus: "VERIFIED" },
          orderBy: [{ completedJobs: "desc" }, { rating: "desc" }],
          take: input.limit,
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        });

        // Get revenue for each appraiser from completed job payouts
        const appraisersWithRevenue = await Promise.all(
          appraisers.map(async (appraiser) => {
            const revenue = await ctx.prisma.payment.aggregate({
              where: {
                userId: appraiser.userId,
                type: "JOB_PAYOUT",
                status: "COMPLETED",
              },
              _sum: { amount: true },
            });

            return {
              id: appraiser.userId,
              name: `${appraiser.user.firstName} ${appraiser.user.lastName}`,
              completedJobs: appraiser.completedJobs,
              rating: appraiser.rating,
              revenue: Number(revenue._sum.amount || 0),
            };
          }),
        );

        return appraisersWithRevenue;
      }),

    /**
     * Top organizations by job volume
     */
    topOrganizations: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
      .query(async ({ ctx, input }) => {
        const orgs = await ctx.prisma.organization.findMany({
          orderBy: { appraisalRequests: { _count: "desc" } },
          take: input.limit,
          include: {
            _count: { select: { appraisalRequests: true } },
          },
        });

        return orgs.map((org) => ({
          id: org.id,
          name: org.name,
          plan: org.plan,
          jobCount: org._count.appraisalRequests,
        }));
      }),

    /**
     * Top counties by job volume
     */
    topCounties: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
      .query(async ({ ctx, input }) => {
        // Use Prisma groupBy for safe querying
        const counties = await ctx.prisma.property.groupBy({
          by: ["county"],
          where: {
            county: { not: "" },
          },
          _count: { id: true },
        });

        // Sort and limit after query
        const sorted = counties
          .filter((c): c is typeof c & { county: string } => c.county !== null)
          .sort((a, b) => (b._count?.id ?? 0) - (a._count?.id ?? 0))
          .slice(0, input.limit);

        const total = sorted.reduce((sum, c) => sum + (c._count?.id ?? 0), 0);

        return sorted.map((c) => ({
          county: c.county || "Unknown",
          count: c._count?.id ?? 0,
          percentage:
            total > 0 ? Math.round(((c._count?.id ?? 0) / total) * 100) : 0,
        }));
      }),

    /**
     * Average job turnaround time in days
     */
    averageTurnaround: adminProcedure.query(async ({ ctx }) => {
      const jobs = await ctx.prisma.job.findMany({
        where: {
          status: "COMPLETED",
          completedAt: { not: null },
        },
        select: { createdAt: true, completedAt: true },
      });

      if (jobs.length === 0) return 0;

      const totalDays = jobs.reduce((sum, job) => {
        const days =
          (job.completedAt!.getTime() - job.createdAt.getTime()) / 86400000;
        return sum + days;
      }, 0);

      return Math.round((totalDays / jobs.length) * 10) / 10;
    }),

    /**
     * Average satisfaction score from appraiser ratings
     */
    satisfactionScore: adminProcedure.query(async ({ ctx }) => {
      const result = await ctx.prisma.appraiserProfile.aggregate({
        where: { rating: { gt: 0 } },
        _avg: { rating: true },
      });

      return Math.round((result._avg.rating || 0) * 10) / 10;
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
          reason: z
            .string()
            .min(5, "Reason must be at least 5 characters")
            .max(1000)
            .trim(),
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

        // Cancel any active jobs (including DISPATCHED for complete cleanup)
        const affectedJobs = await ctx.prisma.job.updateMany({
          where: {
            assignedAppraiserId: input.userId,
            status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
          },
          data: {
            status: "PENDING_DISPATCH",
            assignedAppraiserId: null,
          },
        });

        // Create audit log
        await ctx.prisma.auditLog.create({
          data: {
            action: "APPRAISER_SUSPENDED",
            resource: "User",
            resourceId: input.userId,
            userId: ctx.user.id,
            metadata: {
              reason: input.reason,
              affectedJobsCount: affectedJobs.count,
            },
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

        // Create audit log
        await ctx.prisma.auditLog.create({
          data: {
            action: "APPRAISER_REACTIVATED",
            resource: "User",
            resourceId: input.userId,
            userId: ctx.user.id,
          },
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
          reason: z
            .string()
            .min(5, "Reason must be at least 5 characters")
            .max(1000)
            .trim(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Suspend all users in the organization
        await ctx.prisma.user.updateMany({
          where: { organizationId: input.id },
          data: { status: "SUSPENDED" },
        });

        // Cancel any active jobs (including PENDING_DISPATCH for complete cleanup)
        await ctx.prisma.job.updateMany({
          where: {
            organizationId: input.id,
            status: {
              in: ["PENDING_DISPATCH", "DISPATCHED", "ACCEPTED", "IN_PROGRESS"],
            },
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
          reason: z
            .string()
            .min(5, "Reason must be at least 5 characters")
            .max(1000)
            .trim(),
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
          reason: z
            .string()
            .min(5, "Reason must be at least 5 characters")
            .max(1000)
            .trim(),
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
          reason: z
            .string()
            .min(5, "Reason must be at least 5 characters")
            .max(1000)
            .trim(),
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
          reason: z
            .string()
            .min(5, "Reason must be at least 5 characters")
            .max(1000)
            .trim(),
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
          reason: z
            .string()
            .min(5, "Reason must be at least 5 characters")
            .max(1000)
            .trim(),
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
        // Check for duplicate rule with same conditions
        const existing = await ctx.prisma.pricingRule.findFirst({
          where: {
            ruleType: input.ruleType,
            propertyType: input.propertyType ?? null,
            jobType: input.jobType ?? null,
            county: input.county ?? null,
            isActive: true,
          },
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A pricing rule with these conditions already exists",
          });
        }

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
          type: "JOB_PAYOUT",
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
          type: "JOB_PAYOUT";
          status: "PENDING";
          userId?: { in: string[] };
        } = {
          type: "JOB_PAYOUT",
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

  /**
   * Seed demo data for Insights, PropertyOwners, and Engineers
   */
  seedDemoData: adminProcedure.mutation(async ({ ctx }) => {
    const results = {
      insights: 0,
      propertyOwners: 0,
      engineers: 0,
    };

    // Investment Insights
    const insights = [
      {
        type: "MUNICIPAL_BOND" as const,
        title: "Harris County Infrastructure Bond",
        description:
          "Harris County approved a $1.2 billion bond for flood control improvements, road repairs, and park renovations.",
        source: "Harris County Bond Office",
        sourceUrl: "https://www.harriscountytx.gov/bonds",
        latitude: 29.7604,
        longitude: -95.3698,
        city: "Houston",
        county: "Harris",
        state: "TX",
        zipCode: "77002",
        impactRadiusMiles: 25,
        estimatedValue: 1200000000,
        fundingAmount: 1200000000,
        expectedROI: 12.5,
        parcelsAffected: 4250,
        avgValueChange: 18.4,
        announcedAt: new Date("2024-08-15"),
        expectedStart: new Date("2025-03-01"),
        expectedEnd: new Date("2028-12-31"),
        status: "ACTIVE" as const,
        tags: ["infrastructure", "flood-control", "transportation"],
      },
      {
        type: "SCHOOL_CONSTRUCTION" as const,
        title: "Frisco ISD New Elementary School",
        description:
          "Frisco ISD breaking ground on a new 850-student elementary school in the Panther Creek development.",
        source: "Frisco ISD Board",
        sourceUrl: "https://www.friscoisd.org/construction",
        latitude: 33.1507,
        longitude: -96.8236,
        city: "Frisco",
        county: "Collin",
        state: "TX",
        zipCode: "75034",
        impactRadiusMiles: 5,
        estimatedValue: 45000000,
        fundingAmount: 45000000,
        expectedROI: 15.3,
        parcelsAffected: 1247,
        avgValueChange: 22.3,
        announcedAt: new Date("2024-06-01"),
        expectedStart: new Date("2025-01-15"),
        expectedEnd: new Date("2026-08-01"),
        status: "ACTIVE" as const,
        tags: ["education", "residential-growth", "family-friendly"],
      },
      {
        type: "ROAD_PROJECT" as const,
        title: "I-35 Expansion - Austin Central",
        description:
          "TxDOT approved $4.9 billion I-35 expansion through central Austin with managed lanes.",
        source: "Texas Department of Transportation",
        sourceUrl: "https://my35.org/",
        latitude: 30.2672,
        longitude: -97.7431,
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78701",
        impactRadiusMiles: 30,
        estimatedValue: 4900000000,
        fundingAmount: 4900000000,
        expectedROI: 11.2,
        parcelsAffected: 8920,
        avgValueChange: 26.8,
        announcedAt: new Date("2024-03-15"),
        expectedStart: new Date("2025-09-01"),
        expectedEnd: new Date("2033-12-31"),
        status: "ACTIVE" as const,
        tags: ["transportation", "highway", "major-infrastructure"],
      },
      {
        type: "DEVELOPMENT_PERMIT" as const,
        title: "The Domain North Expansion",
        description:
          "Major mixed-use development approved north of The Domain. 2.5 million sq ft of office, retail, and residential space.",
        source: "Austin Planning Commission",
        sourceUrl: "https://austin.gov/planning/domain-north",
        latitude: 30.4021,
        longitude: -97.7239,
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78758",
        impactRadiusMiles: 3,
        estimatedValue: 850000000,
        expectedROI: 18.5,
        parcelsAffected: 1560,
        avgValueChange: 34.2,
        announcedAt: new Date("2024-09-10"),
        expectedStart: new Date("2025-04-01"),
        expectedEnd: new Date("2029-12-31"),
        status: "ACTIVE" as const,
        tags: ["mixed-use", "office", "residential", "retail"],
      },
      {
        type: "TAX_INCENTIVE" as const,
        title: "Tesla Gigafactory Tax Abatement Extension",
        description:
          "Travis County extended property tax abatement for Tesla Gigafactory through 2035.",
        source: "Travis County Commissioners Court",
        sourceUrl: "https://www.traviscountytx.gov/tesla",
        latitude: 30.2236,
        longitude: -97.6159,
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78725",
        impactRadiusMiles: 10,
        estimatedValue: 10000000000,
        fundingAmount: 150000000,
        expectedROI: 25.0,
        parcelsAffected: 4560,
        avgValueChange: 52.3,
        announcedAt: new Date("2024-08-20"),
        expectedStart: new Date("2024-09-01"),
        expectedEnd: new Date("2035-12-31"),
        status: "ACTIVE" as const,
        tags: ["manufacturing", "jobs", "automotive", "tech"],
      },
      {
        type: "INFRASTRUCTURE" as const,
        title: "San Antonio Water System Expansion",
        description:
          "SAWS approved $2.1 billion infrastructure upgrade including new water treatment plant.",
        source: "San Antonio Water System",
        sourceUrl: "https://www.saws.org/infrastructure",
        latitude: 29.4241,
        longitude: -98.4936,
        city: "San Antonio",
        county: "Bexar",
        state: "TX",
        zipCode: "78205",
        impactRadiusMiles: 35,
        estimatedValue: 2100000000,
        fundingAmount: 2100000000,
        expectedROI: 9.2,
        parcelsAffected: 12500,
        avgValueChange: 13.2,
        announcedAt: new Date("2024-04-01"),
        expectedStart: new Date("2025-01-15"),
        expectedEnd: new Date("2032-12-31"),
        status: "ACTIVE" as const,
        tags: ["water", "utilities", "long-term-growth"],
      },
    ];

    for (const insight of insights) {
      const id = insight.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 20);
      await ctx.prisma.investmentInsight.upsert({
        where: { id },
        update: insight,
        create: { id, ...insight },
      });
      results.insights++;
    }

    // Property Owners
    const propertyOwners = [
      {
        parcelId: "HC-2024-001234",
        county: "Harris",
        addressLine1: "1234 Westheimer Rd",
        city: "Houston",
        state: "TX",
        zipCode: "77006",
        ownerName: "Westheimer Properties LLC",
        ownerType: "corporation",
        phone: "(713) 555-0101",
        email: "info@westheimerprop.com",
        latitude: 29.7423,
        longitude: -95.4019,
        lotSizeSqft: 45000,
        zoning: "MU-3",
        landUse: "Commercial",
        assessedValue: 2850000,
        taxAmount: 68400,
        dataSource: "harris_county_cad",
      },
      {
        parcelId: "TC-2024-001111",
        county: "Travis",
        addressLine1: "1111 South Congress Ave",
        city: "Austin",
        state: "TX",
        zipCode: "78704",
        ownerName: "SoCo Development Partners",
        ownerType: "partnership",
        phone: "(512) 555-0111",
        email: "dev@socopartners.com",
        latitude: 30.2469,
        longitude: -97.7501,
        lotSizeSqft: 32000,
        zoning: "CS-MU-V-CO",
        landUse: "Mixed Use",
        assessedValue: 6200000,
        taxAmount: 136400,
        dataSource: "tcad_public_records",
      },
      {
        parcelId: "CC-2024-004444",
        county: "Collin",
        addressLine1: "4444 Legacy Dr",
        city: "Plano",
        state: "TX",
        zipCode: "75024",
        ownerName: "Legacy Business Park LP",
        ownerType: "partnership",
        phone: "(972) 555-0444",
        email: "leasing@legacybp.com",
        latitude: 33.0762,
        longitude: -96.8086,
        lotSizeSqft: 520000,
        zoning: "PD-O",
        landUse: "Office",
        assessedValue: 42000000,
        taxAmount: 882000,
        dataSource: "collin_cad",
      },
      {
        parcelId: "BC-2024-006666",
        county: "Bexar",
        addressLine1: "6666 Broadway",
        city: "San Antonio",
        state: "TX",
        zipCode: "78209",
        ownerName: "Broadway Retail Partners",
        ownerType: "partnership",
        phone: "(210) 555-0666",
        email: "retail@broadwaysa.com",
        latitude: 29.4832,
        longitude: -98.4623,
        lotSizeSqft: 68000,
        zoning: "C-3",
        landUse: "Commercial",
        assessedValue: 5400000,
        taxAmount: 118800,
        dataSource: "bcad_records",
      },
      {
        parcelId: "DC-2024-008888",
        county: "Dallas",
        addressLine1: "8888 Main St",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        ownerName: "Downtown Dallas Properties Inc",
        ownerType: "corporation",
        phone: "(214) 555-0888",
        email: "info@downtowndallas.com",
        latitude: 32.7827,
        longitude: -96.7968,
        lotSizeSqft: 42000,
        zoning: "CA-1(A)",
        landUse: "Commercial",
        assessedValue: 32000000,
        taxAmount: 736000,
        dataSource: "dcad_records",
      },
    ];

    for (const owner of propertyOwners) {
      await ctx.prisma.propertyOwner.upsert({
        where: {
          parcelId_county: {
            parcelId: owner.parcelId,
            county: owner.county,
          },
        },
        update: {},
        create: owner,
      });
      results.propertyOwners++;
    }

    // Engineers
    const engineers = [
      {
        companyName: "Texas Geotechnical Engineering Inc",
        contactName: "Dr. Robert Martinez",
        phone: "(713) 555-2001",
        email: "rmartinez@texasgeotech.com",
        website: "https://www.texasgeotech.com",
        addressLine1: "4500 Post Oak Blvd Suite 300",
        city: "Houston",
        county: "Harris",
        state: "TX",
        zipCode: "77027",
        latitude: 29.7499,
        longitude: -95.4605,
        serviceRadiusMiles: 75,
        specialties: ["soil", "geotechnical", "environmental"],
        licenseNumber: "PE-87234",
        licenseState: "TX",
        certifications: ["PG", "ENV-SP"],
        rating: 4.8,
        reviewCount: 127,
        isVerified: true,
        isActive: true,
      },
      {
        companyName: "Central Texas Soil Consultants",
        contactName: "James Wilson, PG",
        phone: "(512) 555-3001",
        email: "jwilson@centraltexassoil.com",
        website: "https://www.centraltexassoil.com",
        addressLine1: "8000 Research Blvd Suite 200",
        city: "Austin",
        county: "Travis",
        state: "TX",
        zipCode: "78758",
        latitude: 30.3755,
        longitude: -97.7239,
        serviceRadiusMiles: 80,
        specialties: ["soil", "geotechnical", "environmental"],
        licenseNumber: "PG-4521",
        licenseState: "TX",
        certifications: ["PG", "RG"],
        rating: 4.6,
        reviewCount: 94,
        isVerified: true,
        isActive: true,
      },
      {
        companyName: "North Texas Geotechnical Services",
        contactName: "William Brown, PE, PG",
        phone: "(214) 555-4001",
        email: "wbrown@ntxgeotech.com",
        website: "https://www.ntxgeotech.com",
        addressLine1: "5001 LBJ Fwy Suite 800",
        city: "Dallas",
        county: "Dallas",
        state: "TX",
        zipCode: "75244",
        latitude: 32.9207,
        longitude: -96.8209,
        serviceRadiusMiles: 70,
        specialties: ["geotechnical", "soil", "structural"],
        licenseNumber: "PE-76234",
        licenseState: "TX",
        certifications: ["PG", "D.GE"],
        rating: 4.7,
        reviewCount: 143,
        isVerified: true,
        isActive: true,
      },
      {
        companyName: "Alamo Geotechnical Engineers",
        contactName: "Carlos Garcia, PE",
        phone: "(210) 555-5001",
        email: "cgarcia@alamogeotech.com",
        website: "https://www.alamogeotech.com",
        addressLine1: "100 NE Loop 410 Suite 500",
        city: "San Antonio",
        county: "Bexar",
        state: "TX",
        zipCode: "78216",
        latitude: 29.5155,
        longitude: -98.4636,
        serviceRadiusMiles: 75,
        specialties: ["geotechnical", "soil", "environmental"],
        licenseNumber: "PE-84321",
        licenseState: "TX",
        certifications: ["PG", "GE"],
        rating: 4.6,
        reviewCount: 78,
        isVerified: true,
        isActive: true,
      },
      {
        companyName: "Plano Engineering Associates",
        contactName: "Kevin Wright, PE",
        phone: "(972) 555-6001",
        email: "kwright@planoeng.com",
        website: "https://www.planoeng.com",
        addressLine1: "5000 Legacy Dr Suite 250",
        city: "Plano",
        county: "Collin",
        state: "TX",
        zipCode: "75024",
        latitude: 33.0762,
        longitude: -96.8086,
        serviceRadiusMiles: 45,
        specialties: ["civil", "structural", "drainage"],
        licenseNumber: "PE-91234",
        licenseState: "TX",
        certifications: ["LEED AP", "CFM"],
        rating: 4.8,
        reviewCount: 121,
        isVerified: true,
        isActive: true,
      },
    ];

    for (const engineer of engineers) {
      const id = engineer.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 25);
      await ctx.prisma.engineerDirectory.upsert({
        where: { id },
        update: {},
        create: { id, ...engineer },
      });
      results.engineers++;
    }

    return {
      success: true,
      message: `Seeded ${results.insights} insights, ${results.propertyOwners} property owners, ${results.engineers} engineers`,
      ...results,
    };
  }),
});
