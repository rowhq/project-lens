/**
 * Property Router
 * Handles property search and management
 */

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

// Texas counties supported in V1
const SUPPORTED_COUNTIES = [
  "Harris",
  "Dallas",
  "Tarrant",
  "Bexar",
  "Travis",
  "Collin",
  "Denton",
  "Hidalgo",
  "Fort Bend",
  "El Paso",
];

export const propertyRouter = createTRPCRouter({
  /**
   * Search for properties by address
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(3),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      // TODO: Integrate with geocoding service (Mapbox/Google)
      // For now, search existing properties in database

      const properties = await ctx.prisma.property.findMany({
        where: {
          OR: [
            { addressFull: { contains: input.query, mode: "insensitive" } },
            { addressLine1: { contains: input.query, mode: "insensitive" } },
            { parcelId: { contains: input.query, mode: "insensitive" } },
          ],
          state: "TX",
        },
        take: input.limit,
      });

      return properties;
    }),

  /**
   * Geocode an address
   */
  geocode: publicProcedure
    .input(
      z.object({
        address: z.string().min(5),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Integrate with Mapbox geocoding API
      // Placeholder response
      return {
        success: false,
        message: "Geocoding service not configured",
        data: null,
      };
    }),

  /**
   * Validate if address is in supported Texas county
   */
  validate: publicProcedure
    .input(
      z.object({
        address: z.string(),
        county: z.string(),
        state: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { county, state } = input;

      if (state.toUpperCase() !== "TX" && state.toUpperCase() !== "TEXAS") {
        return {
          valid: false,
          reason: "Only Texas properties are supported in V1",
          supportedState: "TX",
        };
      }

      const isSupported = SUPPORTED_COUNTIES.some(
        (c) => c.toLowerCase() === county.toLowerCase()
      );

      if (!isSupported) {
        return {
          valid: false,
          reason: `County "${county}" is not yet supported`,
          supportedCounties: SUPPORTED_COUNTIES,
        };
      }

      return {
        valid: true,
        county,
        state: "TX",
      };
    }),

  /**
   * Get property by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const property = await ctx.prisma.property.findUnique({
        where: { id: input.id },
      });

      if (!property) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Property not found",
        });
      }

      return property;
    }),

  /**
   * Create or update property from external data
   */
  upsert: protectedProcedure
    .input(
      z.object({
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        county: z.string(),
        state: z.string().default("TX"),
        zipCode: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        propertyType: z.enum([
          "SINGLE_FAMILY",
          "MULTI_FAMILY",
          "CONDO",
          "TOWNHOUSE",
          "COMMERCIAL",
          "LAND",
          "MIXED_USE",
        ]),
        parcelId: z.string().optional(),
        yearBuilt: z.number().optional(),
        sqft: z.number().optional(),
        lotSizeSqft: z.number().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        stories: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const addressFull = [
        input.addressLine1,
        input.addressLine2,
        input.city,
        input.state,
        input.zipCode,
      ]
        .filter(Boolean)
        .join(", ");

      // Try to find existing property by parcel ID or address
      const existing = await ctx.prisma.property.findFirst({
        where: {
          OR: [
            ...(input.parcelId
              ? [{ parcelId: input.parcelId, county: input.county }]
              : []),
            { addressFull },
          ],
        },
      });

      if (existing) {
        // Update existing property
        return ctx.prisma.property.update({
          where: { id: existing.id },
          data: {
            ...input,
            addressFull,
          },
        });
      }

      // Create new property
      return ctx.prisma.property.create({
        data: {
          ...input,
          addressFull,
        },
      });
    }),

  /**
   * Fetch property details from external API (ATTOM)
   */
  fetchDetails: protectedProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Integrate with ATTOM Data API
      // Placeholder response
      return {
        success: false,
        message: "ATTOM Data API not configured",
        data: null,
      };
    }),
});
