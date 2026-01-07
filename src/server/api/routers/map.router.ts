/**
 * Map Router
 * API endpoints for interactive map data
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, clientProcedure } from "../trpc";
import { processAppraisal } from "@/server/services/appraisal-processor";
import { PRICING } from "@/shared/config/constants";

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
      }),
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
            email: true,
            phone: true,
          },
        },
      },
    });

    return appraisers.map((appraiser) => ({
      userId: appraiser.userId,
      name: `${appraiser.user.firstName} ${appraiser.user.lastName}`,
      email: appraiser.user.email,
      phone: appraiser.user.phone,
      licenseNumber: appraiser.licenseNumber,
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
      }),
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
  requestValuation: clientProcedure
    .input(
      z.object({
        parcelId: z.string(),
        address: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        city: z.string().optional(),
        county: z.string().optional(),
        state: z.string().default("TX"),
        zipCode: z.string().optional(),
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
          .default("SINGLE_FAMILY"),
        propertyData: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create or find property
      let property = await ctx.prisma.property.findFirst({
        where: {
          OR: [
            { parcelId: input.parcelId },
            {
              latitude: input.latitude,
              longitude: input.longitude,
            },
          ],
        },
      });

      if (!property) {
        property = await ctx.prisma.property.create({
          data: {
            parcelId: input.parcelId,
            addressLine1: input.address,
            city: input.city || "",
            county: input.county || "",
            state: input.state,
            zipCode: input.zipCode || "",
            addressFull: input.address,
            latitude: input.latitude,
            longitude: input.longitude,
            propertyType: input.propertyType,
          },
        });
      }

      // Create appraisal request - AI Reports are included in subscription
      const price = 0;
      const appraisal = await ctx.prisma.appraisalRequest.create({
        data: {
          organizationId: ctx.organization!.id,
          requestedById: ctx.user.id,
          propertyId: property.id,
          requestedType: "AI_REPORT",
          purpose: "Investment Analysis",
          status: "QUEUED",
          price,
          notes: `Quick valuation from map for ${input.address}`,
        },
      });

      // Process immediately in background
      processAppraisal(appraisal.id).catch((err) => {
        console.error("Error processing map valuation:", err);
      });

      return {
        success: true,
        message:
          "AI valuation started! Check your appraisals page for results.",
        appraisalId: appraisal.id,
        propertyId: property.id,
        address: input.address,
      };
    }),
});
