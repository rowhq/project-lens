/**
 * Appraiser Router
 * Handles appraiser profile, verification, and earnings
 */

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  appraiserProcedure,
  adminProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import * as storage from "@/shared/lib/storage";

export const appraiserRouter = createTRPCRouter({
  /**
   * Get appraiser profile
   */
  profile: createTRPCRouter({
    get: appraiserProcedure.query(async ({ ctx }) => {
      // Return profile with user data for display
      const profile = await ctx.prisma.appraiserProfile.findUnique({
        where: { userId: ctx.user.id },
        include: { user: true },
      });

      if (!profile) return null;

      // Calculate streaks from job history
      const completedJobs = await ctx.prisma.job.findMany({
        where: {
          assignedAppraiserId: ctx.user.id,
          status: "COMPLETED",
          completedAt: { not: null },
        },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true },
      });

      // Group jobs by date
      const jobDates = new Set<string>();
      completedJobs.forEach((job) => {
        if (job.completedAt) {
          jobDates.add(job.completedAt.toISOString().split("T")[0]);
        }
      });

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      const checkDate = new Date(today);

      while (true) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (jobDates.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (currentStreak === 0) {
          // Check if we should look at yesterday (job might not be done today yet)
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split("T")[0];
          if (jobDates.has(yesterdayStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      const sortedDates = Array.from(jobDates).sort().reverse();

      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const diffDays = Math.round(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        ...profile,
        currentStreak,
        longestStreak,
      };
    }),

    update: appraiserProcedure
      .input(
        z.object({
          coverageRadiusMiles: z.number().min(5).max(100).optional(),
          homeBaseLat: z.number().optional(),
          homeBaseLng: z.number().optional(),
          availableJobTypes: z.array(z.string()).optional(),
          preferredSchedule: z.record(z.string(), z.any()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.appraiserProfile.update({
          where: { userId: ctx.user.id },
          data: input,
        });
      }),
  }),

  /**
   * License verification
   */
  license: createTRPCRouter({
    submit: protectedProcedure
      .input(
        z.object({
          licenseType: z.enum([
            "TRAINEE",
            "LICENSED",
            "CERTIFIED_RESIDENTIAL",
            "CERTIFIED_GENERAL",
          ]),
          licenseNumber: z.string().min(1),
          licenseExpiry: z.string(),
          licenseFileUrl: z.string().url().optional(),
          homeBaseLat: z.number(),
          homeBaseLng: z.number(),
          coverageRadiusMiles: z.number().min(5).max(100).default(50),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Check if profile already exists
        const existing = await ctx.prisma.appraiserProfile.findUnique({
          where: { userId: ctx.user.id },
        });

        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Profile already exists",
          });
        }

        // Create appraiser profile
        const profile = await ctx.prisma.appraiserProfile.create({
          data: {
            userId: ctx.user.id,
            licenseType: input.licenseType,
            licenseNumber: input.licenseNumber,
            licenseExpiry: new Date(input.licenseExpiry),
            licenseFileUrl: input.licenseFileUrl,
            homeBaseLat: input.homeBaseLat,
            homeBaseLng: input.homeBaseLng,
            coverageRadiusMiles: input.coverageRadiusMiles,
            verificationStatus: "PENDING",
          },
        });

        // Update user role
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: { role: "APPRAISER" },
        });

        return profile;
      }),

    verify: adminProcedure
      .input(
        z.object({
          userId: z.string(),
          action: z.enum(["APPROVE", "REJECT"]),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await ctx.prisma.appraiserProfile.findUnique({
          where: { userId: input.userId },
        });

        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return ctx.prisma.appraiserProfile.update({
          where: { userId: input.userId },
          data: {
            verificationStatus:
              input.action === "APPROVE" ? "VERIFIED" : "REVOKED",
            verifiedAt: input.action === "APPROVE" ? new Date() : null,
            verificationNotes: input.notes,
          },
        });
      }),

    /**
     * Get presigned URL for license document upload
     */
    getUploadUrl: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileType: z.string(),
          fileSize: z.number().max(10 * 1024 * 1024), // Max 10MB
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Validate file type
        const validTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!validTypes.includes(input.fileType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file type. Only PDF, JPG, and PNG are allowed.",
          });
        }

        // Generate unique key
        const timestamp = Date.now();
        const ext = input.fileName.split(".").pop() || "pdf";
        const fileKey = `licenses/${ctx.user.id}/${timestamp}.${ext}`;

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
  }),

  /**
   * Schedule and availability
   */
  schedule: createTRPCRouter({
    get: appraiserProcedure.query(async ({ ctx }) => {
      return {
        preferredSchedule: ctx.appraiserProfile.preferredSchedule,
        availableJobTypes: ctx.appraiserProfile.availableJobTypes,
      };
    }),

    update: appraiserProcedure
      .input(
        z.object({
          preferredSchedule: z.record(z.string(), z.any()),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.prisma.appraiserProfile.update({
          where: { userId: ctx.user.id },
          data: { preferredSchedule: input.preferredSchedule },
        });
      }),

    // Set weekly availability for all days
    setWeeklyAvailability: appraiserProcedure
      .input(
        z.object({
          schedule: z.record(
            z.string(), // day name: "Sun", "Mon", etc.
            z.object({
              isAvailable: z.boolean(),
              startTime: z.string().optional(), // "08:00"
              endTime: z.string().optional(), // "18:00"
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await ctx.prisma.appraiserProfile.update({
          where: { userId: ctx.user.id },
          data: {
            preferredSchedule: input.schedule,
          },
        });

        return profile;
      }),

    // Set availability for a specific date
    setDateAvailability: appraiserProcedure
      .input(
        z.object({
          date: z.string(), // ISO date string "2025-01-15"
          isAvailable: z.boolean(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Get current schedule
        const currentSchedule =
          (ctx.appraiserProfile.preferredSchedule as Record<string, unknown>) ||
          {};

        // Add or update the specific date override
        const dateOverrides = {
          ...((currentSchedule.dateOverrides as object) || {}),
        } as Record<string, object>;
        dateOverrides[input.date] = {
          isAvailable: input.isAvailable,
          startTime: input.startTime,
          endTime: input.endTime,
        };

        const profile = await ctx.prisma.appraiserProfile.update({
          where: { userId: ctx.user.id },
          data: {
            preferredSchedule: {
              ...currentSchedule,
              dateOverrides: dateOverrides as object,
            } as object,
          },
        });

        return profile;
      }),

    // Remove a date override
    removeDateOverride: appraiserProcedure
      .input(
        z.object({
          date: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const currentSchedule =
          (ctx.appraiserProfile.preferredSchedule as Record<string, unknown>) ||
          {};
        const dateOverrides = {
          ...((currentSchedule.dateOverrides as object) || {}),
        } as Record<string, object>;

        delete dateOverrides[input.date];

        const profile = await ctx.prisma.appraiserProfile.update({
          where: { userId: ctx.user.id },
          data: {
            preferredSchedule: {
              ...currentSchedule,
              dateOverrides: dateOverrides as object,
            } as object,
          },
        });

        return profile;
      }),
  }),

  /**
   * Earnings and payouts
   */
  earnings: createTRPCRouter({
    summary: appraiserProcedure.query(async ({ ctx }) => {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      // Get completed jobs today
      const todayJobs = await ctx.prisma.job.findMany({
        where: {
          assignedAppraiserId: ctx.user.id,
          status: "COMPLETED",
          completedAt: { gte: startOfDay },
        },
      });

      // Get completed jobs this month
      const monthlyJobs = await ctx.prisma.job.findMany({
        where: {
          assignedAppraiserId: ctx.user.id,
          status: "COMPLETED",
          completedAt: { gte: startOfMonth },
        },
      });

      // Get completed jobs this week
      const weeklyJobs = await ctx.prisma.job.findMany({
        where: {
          assignedAppraiserId: ctx.user.id,
          status: "COMPLETED",
          completedAt: { gte: startOfWeek },
        },
      });

      // Get pending payouts
      const pendingPayouts = await ctx.prisma.payment.aggregate({
        where: {
          userId: ctx.user.id,
          type: "PAYOUT",
          status: "PENDING",
        },
        _sum: { amount: true },
      });

      // Get total earnings
      const totalEarnings = await ctx.prisma.payment.aggregate({
        where: {
          userId: ctx.user.id,
          type: "PAYOUT",
          status: "COMPLETED",
        },
        _sum: { amount: true },
      });

      const todayEarnings = todayJobs.reduce(
        (sum, job) => sum + Number(job.payoutAmount),
        0,
      );
      const monthlyEarnings = monthlyJobs.reduce(
        (sum, job) => sum + Number(job.payoutAmount),
        0,
      );
      const weeklyEarnings = weeklyJobs.reduce(
        (sum, job) => sum + Number(job.payoutAmount),
        0,
      );

      return {
        totalEarnings: Number(totalEarnings._sum.amount || 0),
        todayEarnings,
        monthlyEarnings,
        weeklyEarnings,
        pendingPayout: Number(pendingPayouts._sum.amount || 0),
        completedJobsToday: todayJobs.length,
        completedJobsThisMonth: monthlyJobs.length,
        completedJobsThisWeek: weeklyJobs.length,
        rating: ctx.appraiserProfile.rating,
        completedJobs: ctx.appraiserProfile.completedJobs,
      };
    }),

    history: appraiserProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const payments = await ctx.prisma.payment.findMany({
          where: {
            userId: ctx.user.id,
            type: "PAYOUT",
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
  }),

  /**
   * Service Areas - available cities for coverage
   * Returns dynamically from config or database
   */
  serviceAreas: createTRPCRouter({
    /**
     * Get available service cities
     * Currently supports Texas, expandable to other states
     */
    getCities: protectedProcedure
      .input(
        z
          .object({
            state: z.string().default("TX"),
          })
          .optional(),
      )
      .query(async ({ input }) => {
        const state = input?.state || "TX";

        // Service area configuration - can be moved to database later
        const serviceAreaConfig: Record<
          string,
          { cities: string[]; name: string }
        > = {
          TX: {
            name: "Texas",
            cities: [
              "Houston",
              "San Antonio",
              "Dallas",
              "Austin",
              "Fort Worth",
              "El Paso",
              "Arlington",
              "Corpus Christi",
              "Plano",
              "Laredo",
              "Lubbock",
              "Irving",
              "Garland",
              "Amarillo",
              "Grand Prairie",
              "McKinney",
              "Frisco",
              "Brownsville",
              "Killeen",
              "Pasadena",
              "McAllen",
              "Mesquite",
              "Waco",
              "Denton",
              "Carrollton",
              "Midland",
              "Abilene",
              "Beaumont",
              "Round Rock",
              "Odessa",
              "Richardson",
              "Pearland",
              "College Station",
              "League City",
              "Lewisville",
              "Tyler",
              "San Marcos",
              "Sugar Land",
              "The Woodlands",
              "Allen",
            ],
          },
          CA: {
            name: "California",
            cities: [
              "Los Angeles",
              "San Diego",
              "San Jose",
              "San Francisco",
              "Fresno",
              "Sacramento",
              "Long Beach",
              "Oakland",
              "Bakersfield",
              "Anaheim",
            ],
          },
          FL: {
            name: "Florida",
            cities: [
              "Jacksonville",
              "Miami",
              "Tampa",
              "Orlando",
              "St. Petersburg",
              "Hialeah",
              "Port St. Lucie",
              "Tallahassee",
              "Cape Coral",
              "Fort Lauderdale",
            ],
          },
        };

        const stateData = serviceAreaConfig[state];
        if (!stateData) {
          return {
            state,
            stateName: state,
            cities: [],
            supported: false,
          };
        }

        return {
          state,
          stateName: stateData.name,
          cities: stateData.cities.sort(),
          supported: true,
        };
      }),

    /**
     * Get all supported states
     */
    getStates: protectedProcedure.query(async () => {
      return [
        { code: "TX", name: "Texas", active: true },
        { code: "CA", name: "California", active: false },
        { code: "FL", name: "Florida", active: false },
      ];
    }),
  }),

  /**
   * Stats for admin
   */
  stats: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.prisma.appraiserProfile.findUnique({
        where: { userId: input.userId },
        include: { user: true },
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

      const jobStats = await ctx.prisma.job.groupBy({
        by: ["status"],
        where: { assignedAppraiserId: input.userId },
        _count: true,
      });

      return {
        profile,
        recentJobs,
        jobStats,
      };
    }),
});
