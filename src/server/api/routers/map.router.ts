/**
 * Map Router
 * API endpoints for interactive map data
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const boundsSchema = z.object({
  north: z.number(),
  south: z.number(),
  east: z.number(),
  west: z.number(),
});

export const mapRouter = createTRPCRouter({
  /**
   * Get jobs within map bounds
   */
  getJobsInBounds: protectedProcedure
    .input(
      z.object({
        bounds: boundsSchema,
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { bounds, status } = input;

      const jobs = await ctx.prisma.job.findMany({
        where: {
          property: {
            latitude: {
              gte: bounds.south,
              lte: bounds.north,
            },
            longitude: {
              gte: bounds.west,
              lte: bounds.east,
            },
          },
          ...(status && { status: status as never }),
        },
        include: {
          property: true,
          assignedAppraiser: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        take: 100,
        orderBy: { createdAt: "desc" },
      });

      return jobs.map((job) => ({
        id: job.id,
        status: job.status,
        jobType: job.jobType,
        payoutAmount: Number(job.payoutAmount),
        slaDueAt: job.slaDueAt,
        latitude: job.property.latitude,
        longitude: job.property.longitude,
        address: job.property.addressLine1,
        city: job.property.city,
        assignedAppraiser: job.assignedAppraiser
          ? `${job.assignedAppraiser.firstName} ${job.assignedAppraiser.lastName}`
          : null,
      }));
    }),

  /**
   * Get all verified appraisers with their coverage areas
   */
  getAppraisers: protectedProcedure.query(async ({ ctx }) => {
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
          },
        },
      },
    });

    return appraisers.map((appraiser) => ({
      userId: appraiser.userId,
      name: `${appraiser.user.firstName} ${appraiser.user.lastName}`,
      latitude: appraiser.homeBaseLat,
      longitude: appraiser.homeBaseLng,
      coverageRadiusMiles: appraiser.coverageRadiusMiles,
      rating: appraiser.rating,
      completedJobs: appraiser.completedJobs,
    }));
  }),

  /**
   * Get map statistics for a region
   */
  getMapStats: protectedProcedure
    .input(
      z.object({
        bounds: boundsSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const boundsFilter = input.bounds
        ? {
            property: {
              latitude: {
                gte: input.bounds.south,
                lte: input.bounds.north,
              },
              longitude: {
                gte: input.bounds.west,
                lte: input.bounds.east,
              },
            },
          }
        : {};

      const [pendingJobs, activeJobs, completedJobs, totalAppraisers] =
        await Promise.all([
          ctx.prisma.job.count({
            where: {
              status: { in: ["PENDING_DISPATCH", "DISPATCHED"] },
              ...boundsFilter,
            },
          }),
          ctx.prisma.job.count({
            where: {
              status: { in: ["ACCEPTED", "IN_PROGRESS"] },
              ...boundsFilter,
            },
          }),
          ctx.prisma.job.count({
            where: {
              status: "COMPLETED",
              ...boundsFilter,
            },
          }),
          ctx.prisma.appraiserProfile.count({
            where: {
              verificationStatus: "VERIFIED",
            },
          }),
        ]);

      return {
        pendingJobs,
        activeJobs,
        completedJobs,
        totalAppraisers,
      };
    }),

  /**
   * Create a new valuation request from map selection
   */
  requestValuation: protectedProcedure
    .input(
      z.object({
        parcelId: z.string(),
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        propertyData: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // For now, just return a placeholder
      // In the future, this would create an AI valuation request
      return {
        success: true,
        message: "Valuation request received. AI valuation coming soon!",
        parcelId: input.parcelId,
        address: input.address,
      };
    }),
});
