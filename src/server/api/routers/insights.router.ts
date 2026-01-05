/**
 * Insights Router
 * Handles investment insights, property owners, and engineer directory
 *
 * This module provides:
 * - Investment insights (municipal bonds, schools, roads, infrastructure)
 * - Property owner contact lookup
 * - Engineer directory search
 * - Heatmap data for opportunities
 */

import { z } from "zod";
import { createTRPCRouter, clientProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { getBoundingBox, calculateDistanceMiles } from "@/shared/lib/geo";

// Insight type values
const INSIGHT_TYPE_VALUES = [
  "MUNICIPAL_BOND",
  "SCHOOL_CONSTRUCTION",
  "ROAD_PROJECT",
  "ZONING_CHANGE",
  "DEVELOPMENT_PERMIT",
  "INFRASTRUCTURE",
  "TAX_INCENTIVE",
] as const;

const INSIGHT_STATUS_VALUES = [
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "PENDING",
] as const;

export const insightsRouter = createTRPCRouter({
  // ============================================
  // INVESTMENT INSIGHTS
  // ============================================

  /**
   * List investment insights with geographic filtering
   */
  listInsights: clientProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        // Type filters
        types: z.array(z.enum(INSIGHT_TYPE_VALUES)).optional(),
        status: z.enum(INSIGHT_STATUS_VALUES).optional(),
        // Geographic filters
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radiusMiles: z.number().min(1).max(500).default(25),
        county: z.string().optional(),
        // Value filters
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
        // Appreciation range filter
        minAppreciation: z.number().optional(),
        maxAppreciation: z.number().optional(),
        // Year filter
        minYear: z.number().optional(),
        maxYear: z.number().optional(),
        // Correlation filter
        minCorrelation: z.number().min(0).max(1).optional(),
        // Search
        search: z.string().optional(),
        // Sorting
        sortBy: z
          .enum([
            "newest",
            "value_desc",
            "distance",
            "expected_roi",
            "correlation",
            "appreciation",
          ])
          .default("newest"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        types,
        status,
        latitude,
        longitude,
        radiusMiles,
        county,
        minValue,
        maxValue,
        minAppreciation,
        maxAppreciation,
        minYear,
        maxYear,
        minCorrelation,
        search,
        sortBy,
      } = input;

      // Build geographic bounding box filter if coordinates provided
      let geoFilter = {};
      if (latitude !== undefined && longitude !== undefined) {
        const bbox = getBoundingBox(latitude, longitude, radiusMiles);
        geoFilter = {
          latitude: { gte: bbox.minLat, lte: bbox.maxLat },
          longitude: { gte: bbox.minLon, lte: bbox.maxLon },
        };
      }

      const where = {
        ...(types && types.length > 0 && { type: { in: types } }),
        ...(status && { status }),
        ...(county && { county }),
        ...geoFilter,
        ...(minValue !== undefined || maxValue !== undefined
          ? {
              estimatedValue: {
                ...(minValue !== undefined && { gte: minValue }),
                ...(maxValue !== undefined && { lte: maxValue }),
              },
            }
          : {}),
        // Appreciation range filter
        ...(minAppreciation !== undefined || maxAppreciation !== undefined
          ? {
              avgValueChange: {
                ...(minAppreciation !== undefined && { gte: minAppreciation }),
                ...(maxAppreciation !== undefined && { lte: maxAppreciation }),
              },
            }
          : {}),
        // Year filter
        ...(minYear !== undefined || maxYear !== undefined
          ? {
              projectYear: {
                ...(minYear !== undefined && { gte: minYear }),
                ...(maxYear !== undefined && { lte: maxYear }),
              },
            }
          : {}),
        // Correlation filter
        ...(minCorrelation !== undefined && {
          correlation: { gte: minCorrelation },
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const orderBy = {
        newest: { createdAt: "desc" as const },
        value_desc: { estimatedValue: "desc" as const },
        expected_roi: { expectedROI: "desc" as const },
        distance: { createdAt: "desc" as const }, // Will be sorted client-side
        correlation: { correlation: "desc" as const },
        appreciation: { avgValueChange: "desc" as const },
      }[sortBy];

      const insights = await ctx.prisma.investmentInsight.findMany({
        where,
        orderBy,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      // If geographic search, filter precisely and sort by distance
      let filteredInsights = insights;
      if (latitude !== undefined && longitude !== undefined) {
        filteredInsights = insights.filter((insight) => {
          const distance = calculateDistanceMiles(
            latitude,
            longitude,
            insight.latitude,
            insight.longitude,
          );
          return distance <= radiusMiles;
        });

        if (sortBy === "distance") {
          filteredInsights.sort((a, b) => {
            const distA = calculateDistanceMiles(
              latitude,
              longitude,
              a.latitude,
              a.longitude,
            );
            const distB = calculateDistanceMiles(
              latitude,
              longitude,
              b.latitude,
              b.longitude,
            );
            return distA - distB;
          });
        }
      }

      let nextCursor: string | undefined;
      if (filteredInsights.length > limit) {
        const nextItem = filteredInsights.pop();
        nextCursor = nextItem?.id;
      }

      // Add calculated distance to each insight if coordinates provided
      const itemsWithDistance = filteredInsights.map((insight) => ({
        ...insight,
        distance:
          latitude !== undefined && longitude !== undefined
            ? calculateDistanceMiles(
                latitude,
                longitude,
                insight.latitude,
                insight.longitude,
              )
            : null,
      }));

      return {
        items: itemsWithDistance,
        nextCursor,
      };
    }),

  /**
   * Get a single insight by ID
   */
  getInsightById: clientProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const insight = await ctx.prisma.investmentInsight.findUnique({
        where: { id: input.id },
      });

      if (!insight) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Insight not found",
        });
      }

      return insight;
    }),

  /**
   * Get insights for map (lightweight version)
   */
  getInsightsForMap: clientProcedure
    .input(
      z.object({
        // Bounding box
        minLat: z.number(),
        maxLat: z.number(),
        minLon: z.number(),
        maxLon: z.number(),
        // Filters
        types: z.array(z.enum(INSIGHT_TYPE_VALUES)).optional(),
        status: z.enum(INSIGHT_STATUS_VALUES).default("ACTIVE"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { minLat, maxLat, minLon, maxLon, types, status } = input;

      const insights = await ctx.prisma.investmentInsight.findMany({
        where: {
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLon, lte: maxLon },
          status,
          ...(types && types.length > 0 && { type: { in: types } }),
        },
        select: {
          id: true,
          type: true,
          title: true,
          latitude: true,
          longitude: true,
          estimatedValue: true,
          expectedROI: true,
          status: true,
          impactRadiusMiles: true,
        },
        take: 500, // Limit for performance
      });

      return insights;
    }),

  /**
   * Get heatmap data for investment opportunities
   */
  getHeatmapData: clientProcedure
    .input(
      z.object({
        // Bounding box
        minLat: z.number(),
        maxLat: z.number(),
        minLon: z.number(),
        maxLon: z.number(),
        // Type filter
        types: z.array(z.enum(INSIGHT_TYPE_VALUES)).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { minLat, maxLat, minLon, maxLon, types } = input;

      // Get all active insights in the area
      const insights = await ctx.prisma.investmentInsight.findMany({
        where: {
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLon, lte: maxLon },
          status: "ACTIVE",
          ...(types && types.length > 0 && { type: { in: types } }),
        },
        select: {
          latitude: true,
          longitude: true,
          estimatedValue: true,
          expectedROI: true,
          impactRadiusMiles: true,
          type: true,
        },
      });

      // Calculate intensity weights based on value and ROI
      const heatmapPoints = insights.map((insight) => {
        const valueWeight = insight.estimatedValue
          ? Math.log10(Number(insight.estimatedValue) + 1) / 10
          : 0.5;
        const roiWeight = insight.expectedROI ? insight.expectedROI / 100 : 0.3;
        const intensity = Math.min(1, (valueWeight + roiWeight) / 2 + 0.2);

        return {
          lat: insight.latitude,
          lng: insight.longitude,
          intensity,
          radius: insight.impactRadiusMiles * 1609.34, // Convert to meters
          type: insight.type,
        };
      });

      return {
        points: heatmapPoints,
        total: heatmapPoints.length,
      };
    }),

  /**
   * Create a new insight (admin only)
   */
  createInsight: adminProcedure
    .input(
      z.object({
        type: z.enum(INSIGHT_TYPE_VALUES),
        title: z.string().min(10).max(200),
        description: z.string().max(5000),
        source: z.string(),
        sourceUrl: z.string().url().optional(),
        latitude: z.number(),
        longitude: z.number(),
        city: z.string().optional(),
        county: z.string(),
        state: z.string().default("TX"),
        zipCode: z.string().optional(),
        impactRadiusMiles: z.number().min(0.5).max(50).default(5),
        estimatedValue: z.number().optional(),
        fundingAmount: z.number().optional(),
        expectedROI: z.number().optional(),
        announcedAt: z.date().optional(),
        expectedStart: z.date().optional(),
        expectedEnd: z.date().optional(),
        status: z.enum(INSIGHT_STATUS_VALUES).default("ACTIVE"),
        tags: z.array(z.string()).optional(),
        metadata: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { metadata, ...rest } = input;
      const insight = await ctx.prisma.investmentInsight.create({
        data: {
          ...rest,
          tags: input.tags || [],
          metadata: metadata ?? undefined,
        },
      });

      return insight;
    }),

  /**
   * Update an insight (admin only)
   */
  updateInsight: adminProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(INSIGHT_TYPE_VALUES).optional(),
        title: z.string().min(10).max(200).optional(),
        description: z.string().max(5000).optional(),
        source: z.string().optional(),
        sourceUrl: z.string().url().optional(),
        status: z.enum(INSIGHT_STATUS_VALUES).optional(),
        estimatedValue: z.number().optional(),
        fundingAmount: z.number().optional(),
        expectedROI: z.number().optional(),
        expectedStart: z.date().optional(),
        expectedEnd: z.date().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, metadata, ...rest } = input;

      const insight = await ctx.prisma.investmentInsight.update({
        where: { id },
        data: {
          ...rest,
          metadata: metadata ?? undefined,
        },
      });

      return insight;
    }),

  /**
   * Delete an insight (admin only)
   */
  deleteInsight: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.investmentInsight.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // ============================================
  // PROPERTY OWNERS
  // ============================================

  /**
   * Search property owners
   */
  searchOwners: clientProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        // Geographic filters
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radiusMiles: z.number().min(0.5).max(50).default(2),
        county: z.string().optional(),
        zipCode: z.string().optional(),
        // Search
        search: z.string().optional(),
        ownerName: z.string().optional(),
        // Filters
        ownerType: z.string().optional(), // individual, corporation, trust
        minLotSize: z.number().optional(),
        maxLotSize: z.number().optional(),
        zoning: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        latitude,
        longitude,
        radiusMiles,
        county,
        zipCode,
        search,
        ownerName,
        ownerType,
        minLotSize,
        maxLotSize,
        zoning,
      } = input;

      // Build geographic bounding box filter if coordinates provided
      let geoFilter = {};
      if (latitude !== undefined && longitude !== undefined) {
        const bbox = getBoundingBox(latitude, longitude, radiusMiles);
        geoFilter = {
          latitude: { gte: bbox.minLat, lte: bbox.maxLat },
          longitude: { gte: bbox.minLon, lte: bbox.maxLon },
        };
      }

      const where = {
        ...(county && { county }),
        ...(zipCode && { zipCode }),
        ...(ownerType && { ownerType }),
        ...(zoning && { zoning }),
        ...geoFilter,
        ...(minLotSize !== undefined || maxLotSize !== undefined
          ? {
              lotSizeSqft: {
                ...(minLotSize !== undefined && { gte: minLotSize }),
                ...(maxLotSize !== undefined && { lte: maxLotSize }),
              },
            }
          : {}),
        ...(ownerName && {
          ownerName: { contains: ownerName, mode: "insensitive" as const },
        }),
        ...(search && {
          OR: [
            { ownerName: { contains: search, mode: "insensitive" as const } },
            {
              addressLine1: { contains: search, mode: "insensitive" as const },
            },
            { city: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const owners = await ctx.prisma.propertyOwner.findMany({
        where,
        orderBy: { lastUpdated: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      // Filter precisely by distance if geographic search
      let filteredOwners = owners;
      if (latitude !== undefined && longitude !== undefined) {
        filteredOwners = owners.filter((owner) => {
          if (!owner.latitude || !owner.longitude) return false;
          const distance = calculateDistanceMiles(
            latitude,
            longitude,
            owner.latitude,
            owner.longitude,
          );
          return distance <= radiusMiles;
        });
      }

      let nextCursor: string | undefined;
      if (filteredOwners.length > limit) {
        const nextItem = filteredOwners.pop();
        nextCursor = nextItem?.id;
      }

      // Add calculated distance
      const itemsWithDistance = filteredOwners.map((owner) => ({
        ...owner,
        distance:
          latitude !== undefined &&
          longitude !== undefined &&
          owner.latitude &&
          owner.longitude
            ? calculateDistanceMiles(
                latitude,
                longitude,
                owner.latitude,
                owner.longitude,
              )
            : null,
      }));

      return {
        items: itemsWithDistance,
        nextCursor,
      };
    }),

  /**
   * Get property owner by parcel ID
   */
  getOwnerByParcel: clientProcedure
    .input(
      z.object({
        parcelId: z.string(),
        county: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const owner = await ctx.prisma.propertyOwner.findUnique({
        where: {
          parcelId_county: {
            parcelId: input.parcelId,
            county: input.county,
          },
        },
      });

      if (!owner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property owner not found",
        });
      }

      return owner;
    }),

  /**
   * Create property owner (admin only)
   */
  createOwner: adminProcedure
    .input(
      z.object({
        parcelId: z.string(),
        county: z.string(),
        addressLine1: z.string(),
        city: z.string(),
        state: z.string().default("TX"),
        zipCode: z.string(),
        ownerName: z.string(),
        ownerType: z.string(),
        mailingAddress: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        lotSizeSqft: z.number().optional(),
        zoning: z.string().optional(),
        landUse: z.string().optional(),
        assessedValue: z.number().optional(),
        taxAmount: z.number().optional(),
        lastSaleDate: z.date().optional(),
        lastSalePrice: z.number().optional(),
        dataSource: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const owner = await ctx.prisma.propertyOwner.create({
        data: input,
      });

      return owner;
    }),

  /**
   * Update property owner (admin only)
   */
  updateOwner: adminProcedure
    .input(
      z.object({
        id: z.string(),
        ownerName: z.string().optional(),
        ownerType: z.string().optional(),
        mailingAddress: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        assessedValue: z.number().optional(),
        zoning: z.string().optional(),
        landUse: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const owner = await ctx.prisma.propertyOwner.update({
        where: { id },
        data: {
          ...data,
          lastUpdated: new Date(),
        },
      });

      return owner;
    }),

  /**
   * Delete property owner (admin only)
   */
  deleteOwner: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.propertyOwner.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Bulk import property owners (admin only)
   */
  importOwners: adminProcedure
    .input(
      z.object({
        owners: z.array(
          z.object({
            parcelId: z.string(),
            county: z.string(),
            addressLine1: z.string(),
            city: z.string(),
            state: z.string().default("TX"),
            zipCode: z.string(),
            ownerName: z.string(),
            ownerType: z.string(),
            mailingAddress: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
            latitude: z.number().optional(),
            longitude: z.number().optional(),
            lotSizeSqft: z.number().optional(),
            zoning: z.string().optional(),
            landUse: z.string().optional(),
            assessedValue: z.number().optional(),
            taxAmount: z.number().optional(),
            lastSaleDate: z.date().optional(),
            lastSalePrice: z.number().optional(),
            dataSource: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.prisma.$transaction(
        input.owners.map((owner) =>
          ctx.prisma.propertyOwner.upsert({
            where: {
              parcelId_county: {
                parcelId: owner.parcelId,
                county: owner.county,
              },
            },
            update: {
              ...owner,
              lastUpdated: new Date(),
            },
            create: owner,
          }),
        ),
      );

      return {
        imported: results.length,
      };
    }),

  // ============================================
  // ENGINEER DIRECTORY
  // ============================================

  /**
   * Search engineers
   */
  searchEngineers: clientProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        // Geographic filters
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radiusMiles: z.number().min(1).max(200).default(50),
        county: z.string().optional(),
        city: z.string().optional(),
        // Specialty filters
        specialties: z.array(z.string()).optional(),
        // Search
        search: z.string().optional(),
        // Filters
        isVerified: z.boolean().optional(),
        minRating: z.number().min(0).max(5).optional(),
        // Sorting
        sortBy: z
          .enum(["distance", "rating", "reviews", "name"])
          .default("distance"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        latitude,
        longitude,
        radiusMiles,
        county,
        city,
        specialties,
        search,
        isVerified,
        minRating,
        sortBy,
      } = input;

      // Build geographic bounding box filter if coordinates provided
      let geoFilter = {};
      if (latitude !== undefined && longitude !== undefined) {
        const bbox = getBoundingBox(latitude, longitude, radiusMiles);
        geoFilter = {
          latitude: { gte: bbox.minLat, lte: bbox.maxLat },
          longitude: { gte: bbox.minLon, lte: bbox.maxLon },
        };
      }

      const where = {
        isActive: true,
        ...(county && { county }),
        ...(city && { city }),
        ...(isVerified !== undefined && { isVerified }),
        ...(minRating !== undefined && { rating: { gte: minRating } }),
        ...geoFilter,
        ...(specialties &&
          specialties.length > 0 && {
            specialties: { hasSome: specialties },
          }),
        ...(search && {
          OR: [
            { companyName: { contains: search, mode: "insensitive" as const } },
            { contactName: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const orderBy = {
        rating: { rating: "desc" as const },
        reviews: { reviewCount: "desc" as const },
        name: { companyName: "asc" as const },
        distance: { createdAt: "desc" as const }, // Will be sorted client-side
      }[sortBy];

      const engineers = await ctx.prisma.engineerDirectory.findMany({
        where,
        orderBy,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      // Filter precisely by distance and service area
      let filteredEngineers = engineers;
      if (latitude !== undefined && longitude !== undefined) {
        filteredEngineers = engineers.filter((engineer) => {
          if (!engineer.latitude || !engineer.longitude) return false;
          const distance = calculateDistanceMiles(
            latitude,
            longitude,
            engineer.latitude,
            engineer.longitude,
          );
          // Check if within engineer's service area OR within search radius
          return distance <= Math.max(engineer.serviceRadiusMiles, radiusMiles);
        });

        if (sortBy === "distance") {
          filteredEngineers.sort((a, b) => {
            const distA =
              a.latitude && a.longitude
                ? calculateDistanceMiles(
                    latitude,
                    longitude,
                    a.latitude,
                    a.longitude,
                  )
                : Infinity;
            const distB =
              b.latitude && b.longitude
                ? calculateDistanceMiles(
                    latitude,
                    longitude,
                    b.latitude,
                    b.longitude,
                  )
                : Infinity;
            return distA - distB;
          });
        }
      }

      let nextCursor: string | undefined;
      if (filteredEngineers.length > limit) {
        const nextItem = filteredEngineers.pop();
        nextCursor = nextItem?.id;
      }

      // Add calculated distance
      const itemsWithDistance = filteredEngineers.map((engineer) => ({
        ...engineer,
        distance:
          latitude !== undefined &&
          longitude !== undefined &&
          engineer.latitude &&
          engineer.longitude
            ? calculateDistanceMiles(
                latitude,
                longitude,
                engineer.latitude,
                engineer.longitude,
              )
            : null,
      }));

      return {
        items: itemsWithDistance,
        nextCursor,
      };
    }),

  /**
   * Get engineer by ID
   */
  getEngineerById: clientProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const engineer = await ctx.prisma.engineerDirectory.findUnique({
        where: { id: input.id },
      });

      if (!engineer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Engineer not found",
        });
      }

      return engineer;
    }),

  /**
   * Get engineers for map (lightweight)
   */
  getEngineersForMap: clientProcedure
    .input(
      z.object({
        minLat: z.number(),
        maxLat: z.number(),
        minLon: z.number(),
        maxLon: z.number(),
        specialties: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { minLat, maxLat, minLon, maxLon, specialties } = input;

      const engineers = await ctx.prisma.engineerDirectory.findMany({
        where: {
          isActive: true,
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLon, lte: maxLon },
          ...(specialties &&
            specialties.length > 0 && {
              specialties: { hasSome: specialties },
            }),
        },
        select: {
          id: true,
          companyName: true,
          latitude: true,
          longitude: true,
          specialties: true,
          rating: true,
          isVerified: true,
          serviceRadiusMiles: true,
        },
        take: 200,
      });

      return engineers;
    }),

  /**
   * Create engineer (admin only)
   */
  createEngineer: adminProcedure
    .input(
      z.object({
        companyName: z.string().min(2).max(200),
        contactName: z.string().optional(),
        phone: z.string(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
        addressLine1: z.string(),
        city: z.string(),
        county: z.string(),
        state: z.string().default("TX"),
        zipCode: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        serviceRadiusMiles: z.number().min(5).max(500).default(50),
        specialties: z.array(z.string()),
        licenseNumber: z.string().optional(),
        licenseState: z.string().optional(),
        certifications: z.array(z.string()).optional(),
        isVerified: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const engineer = await ctx.prisma.engineerDirectory.create({
        data: {
          ...input,
          certifications: input.certifications || [],
        },
      });

      return engineer;
    }),

  /**
   * Update engineer (admin only)
   */
  updateEngineer: adminProcedure
    .input(
      z.object({
        id: z.string(),
        companyName: z.string().min(2).max(200).optional(),
        contactName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
        serviceRadiusMiles: z.number().min(5).max(500).optional(),
        specialties: z.array(z.string()).optional(),
        isVerified: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const engineer = await ctx.prisma.engineerDirectory.update({
        where: { id },
        data,
      });

      return engineer;
    }),

  /**
   * Delete engineer (admin only)
   */
  deleteEngineer: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.engineerDirectory.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Bulk import engineers (admin only)
   */
  importEngineers: adminProcedure
    .input(
      z.object({
        engineers: z.array(
          z.object({
            companyName: z.string(),
            contactName: z.string().optional(),
            phone: z.string(),
            email: z.string().email().optional(),
            website: z.string().url().optional(),
            addressLine1: z.string(),
            city: z.string(),
            county: z.string(),
            state: z.string().default("TX"),
            zipCode: z.string(),
            latitude: z.number().optional(),
            longitude: z.number().optional(),
            serviceRadiusMiles: z.number().default(50),
            specialties: z.array(z.string()),
            licenseNumber: z.string().optional(),
            licenseState: z.string().optional(),
            certifications: z.array(z.string()).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.prisma.engineerDirectory.createMany({
        data: input.engineers.map((engineer) => ({
          ...engineer,
          certifications: engineer.certifications || [],
        })),
        skipDuplicates: true,
      });

      return {
        imported: results.count,
      };
    }),

  // ============================================
  // INSIGHTS STATS
  // ============================================

  /**
   * Get insights statistics by county
   */
  getStats: clientProcedure
    .input(
      z.object({
        county: z.string().optional(),
        state: z.string().default("TX"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        status: "ACTIVE" as const,
        ...(input.county && { county: input.county }),
        state: input.state,
      };

      const [
        totalInsights,
        insightsByType,
        totalValue,
        ownerCount,
        engineerCount,
      ] = await Promise.all([
        ctx.prisma.investmentInsight.count({ where }),
        ctx.prisma.investmentInsight.groupBy({
          by: ["type"],
          where,
          _count: { type: true },
        }),
        ctx.prisma.investmentInsight.aggregate({
          where,
          _sum: { estimatedValue: true },
        }),
        ctx.prisma.propertyOwner.count({
          where: {
            ...(input.county && { county: input.county }),
            state: input.state,
          },
        }),
        ctx.prisma.engineerDirectory.count({
          where: {
            isActive: true,
            ...(input.county && { county: input.county }),
            state: input.state,
          },
        }),
      ]);

      return {
        totalInsights,
        insightsByType: insightsByType.reduce(
          (acc, item) => ({ ...acc, [item.type]: item._count.type }),
          {} as Record<string, number>,
        ),
        totalEstimatedValue: totalValue._sum.estimatedValue,
        totalPropertyOwners: ownerCount,
        totalEngineers: engineerCount,
      };
    }),
});
