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
          status: z.enum(["PENDING", "VERIFIED", "EXPIRED", "REVOKED"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const profiles = await ctx.prisma.appraiserProfile.findMany({
          where: input.status ? { verificationStatus: input.status } : undefined,
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
        })
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
          plan: z.enum(["FREE_TRIAL", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
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
            where: { organizationId: input.id, createdAt: { gte: lastMonth, lt: thisMonth } },
          }),
        ]);

        const growthPercent = lastMonthRequests > 0
          ? Math.round(((thisMonthRequests - lastMonthRequests) / lastMonthRequests) * 100)
          : thisMonthRequests > 0 ? 100 : 0;

        return { org, recentAppraisals, payments, stats: { thisMonthRequests, lastMonthRequests, growthPercent } };
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
        })
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
        })
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
        })
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
        })
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
            property: { select: { addressFull: true, city: true, county: true } },
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
        })
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
        })
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
        })
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
        })
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
        0
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
        avgPayout: appraiserCount > 0 ? Math.round(totalPending / appraiserCount) : 0,
        pendingPayouts,
      };
    }),

    // Process payouts to appraisers
    processPayouts: adminProcedure
      .input(
        z.object({
          appraiserIds: z.array(z.string()).optional(), // If empty, process all
        })
      )
      .mutation(async ({ ctx, input }) => {
        const whereClause: { type: "PAYOUT"; status: "PENDING"; userId?: { in: string[] } } = {
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

          const totalAmount = payouts.reduce((sum, p) => sum + Number(p.amount), 0);
          const stripeConnectId = appraiser.appraiserProfile?.stripeConnectId;

          // Check if appraiser has Stripe Connect account
          if (!stripeConnectId) {
            await ctx.prisma.payment.updateMany({
              where: { id: { in: payouts.map((p) => p.id) } },
              data: { status: "PENDING", statusMessage: "Stripe Connect not configured" },
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
                statusMessage: stripeError instanceof Error ? stripeError.message : "Stripe transfer failed",
              },
            });
            results.push({
              appraiserId,
              success: false,
              error: stripeError instanceof Error ? stripeError.message : "Stripe transfer failed",
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
              totalAmount: results.reduce((sum, r) => sum + (r.success ? (r.amount ?? 0) : 0), 0),
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
        })
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
      })
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
