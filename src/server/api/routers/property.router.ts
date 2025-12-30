/**
 * Property Router
 * Handles property search, geocoding, and data fetching
 */

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import * as mapbox from "@/shared/lib/mapbox";
import * as attom from "@/shared/lib/attom";

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
  "Williamson",
  "Montgomery",
  "Brazoria",
  "Galveston",
  "Nueces",
];

export const propertyRouter = createTRPCRouter({
  /**
   * Search for properties by address (autocomplete)
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(3),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      // First try Mapbox for geocoding suggestions
      try {
        const results = await mapbox.searchAddresses(input.query, {
          limit: input.limit,
          bbox: mapbox.getTexasBbox(),
        });

        if (results.length > 0) {
          return results.map((r) => ({
            id: r.id,
            address: r.address,
            city: r.city,
            state: r.state,
            zipCode: r.zipCode,
            county: r.county,
            latitude: r.latitude,
            longitude: r.longitude,
            source: "mapbox" as const,
          }));
        }
      } catch (error) {
        console.error("Mapbox search error:", error);
      }

      // Fallback to database search
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

      return properties.map((p) => ({
        id: p.id,
        address: p.addressLine1,
        city: p.city,
        state: p.state,
        zipCode: p.zipCode,
        county: p.county,
        latitude: p.latitude,
        longitude: p.longitude,
        source: "database" as const,
      }));
    }),

  /**
   * Geocode an address to get coordinates and validate
   */
  geocode: publicProcedure
    .input(
      z.object({
        address: z.string().min(5),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await mapbox.geocodeAddress(input.address);

        if (!result) {
          return {
            success: false,
            message: "Address not found",
            data: null,
          };
        }

        // Validate it's in Texas
        if (result.state !== "TX" && result.state !== "Texas") {
          return {
            success: false,
            message: "Only Texas properties are supported",
            data: null,
          };
        }

        // Validate it's in a supported county
        const isSupported = SUPPORTED_COUNTIES.some(
          (c) => c.toLowerCase() === result.county.toLowerCase()
        );

        return {
          success: true,
          message: isSupported
            ? "Address validated"
            : `County "${result.county}" is not yet fully supported, but you can proceed`,
          data: {
            address: result.address,
            city: result.city,
            state: result.state,
            zipCode: result.zipCode,
            county: result.county,
            latitude: result.latitude,
            longitude: result.longitude,
            isFullySupported: isSupported,
          },
        };
      } catch (error) {
        console.error("Geocoding error:", error);
        return {
          success: false,
          message: "Geocoding service temporarily unavailable",
          data: null,
        };
      }
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
   * Fetch property details from ATTOM Data API
   */
  fetchDetails: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        city: z.string(),
        state: z.string().default("TX"),
        zipCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get property details from ATTOM
        const property = await attom.getPropertyByAddress({
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
        });

        if (!property) {
          return {
            success: false,
            message: "Property not found in ATTOM database",
            data: null,
          };
        }

        // Get AVM (Automated Valuation Model)
        const avm = await attom.getPropertyAVM({
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
        });

        // Normalize the data
        const normalizedProperty = attom.normalizeProperty(property);

        return {
          success: true,
          message: "Property details retrieved",
          data: {
            ...normalizedProperty,
            avm: avm
              ? {
                  value: avm.avm.amount.value,
                  valueHigh: avm.avm.amount.high,
                  valueLow: avm.avm.amount.low,
                  calculatedDate: avm.avm.calculated,
                }
              : null,
          },
        };
      } catch (error) {
        console.error("ATTOM fetch error:", error);
        return {
          success: false,
          message: "Failed to fetch property details. The service may be temporarily unavailable.",
          data: null,
        };
      }
    }),

  /**
   * Get comparable sales for a property
   */
  getComparables: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        city: z.string(),
        state: z.string().default("TX"),
        zipCode: z.string().optional(),
        radius: z.number().min(0.5).max(5).default(1),
        limit: z.number().min(3).max(15).default(6),
      })
    )
    .query(async ({ input }) => {
      try {
        const comps = await attom.getComparableSales({
          address: input.address,
          city: input.city,
          state: input.state,
          zipCode: input.zipCode,
          radius: input.radius,
          maxResults: input.limit,
        });

        return {
          success: true,
          comparables: comps.map(attom.normalizeComparable),
        };
      } catch (error) {
        console.error("ATTOM comparables error:", error);
        return {
          success: false,
          comparables: [],
          message: "Failed to fetch comparable sales",
        };
      }
    }),

  /**
   * Get market statistics for a zip code
   */
  getMarketStats: protectedProcedure
    .input(
      z.object({
        zipCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const stats = await attom.getMarketStats({ zipCode: input.zipCode });

        if (!stats) {
          return {
            success: false,
            data: null,
            message: "Market data not available for this area",
          };
        }

        return {
          success: true,
          data: stats,
        };
      } catch (error) {
        console.error("ATTOM market stats error:", error);
        return {
          success: false,
          data: null,
          message: "Failed to fetch market statistics",
        };
      }
    }),

  /**
   * Get a static map image URL for a property
   */
  getMapImage: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        width: z.number().min(100).max(1280).default(600),
        height: z.number().min(100).max(1280).default(400),
        zoom: z.number().min(10).max(18).default(15),
      })
    )
    .query(({ input }) => {
      try {
        const url = mapbox.getStaticMapUrl({
          latitude: input.latitude,
          longitude: input.longitude,
          width: input.width,
          height: input.height,
          zoom: input.zoom,
          marker: true,
        });

        return { url };
      } catch (error) {
        return { url: null };
      }
    }),
});
