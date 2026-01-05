/**
 * Marketplace Router
 * Handles DD Marketplace operations for buying/selling reports and studies
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure, clientProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import * as stripe from "@/shared/lib/stripe";
import { getBoundingBox, calculateDistanceMiles } from "@/shared/lib/geo";

// Platform fee is 20%
const PLATFORM_FEE_PERCENTAGE = 0.2;

// Study categories enum values
const STUDY_CATEGORY_VALUES = [
  "APPRAISAL_REPORT",
  "SOIL_STUDY",
  "DRAINAGE_STUDY",
  "CIVIL_ENGINEERING",
  "ENVIRONMENTAL",
  "GEOTECHNICAL",
  "STRUCTURAL",
  "FLOOD_RISK",
  "ZONING_ANALYSIS",
  "SURVEY",
  "TITLE_REPORT",
  "OTHER",
] as const;

export const marketplaceRouter = createTRPCRouter({
  /**
   * List marketplace listings with filters including geographic search
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        category: z.string().optional(),
        studyCategory: z.enum(STUDY_CATEGORY_VALUES).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z
          .enum(["newest", "price_asc", "price_desc", "popular", "distance"])
          .default("newest"),
        search: z.string().optional(),
        // Geographic filters
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radiusMiles: z.number().min(1).max(500).default(50),
        county: z.string().optional(),
        zipCode: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        limit,
        cursor,
        category,
        studyCategory,
        minPrice,
        maxPrice,
        sortBy,
        search,
        latitude,
        longitude,
        radiusMiles,
        county,
        zipCode,
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
        status: "ACTIVE" as const,
        ...(category && { category }),
        ...(studyCategory && { studyCategory }),
        ...(county && { county }),
        ...(zipCode && { zipCode }),
        ...geoFilter,
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const orderBy = {
        newest: { createdAt: "desc" as const },
        price_asc: { price: "asc" as const },
        price_desc: { price: "desc" as const },
        popular: { soldCount: "desc" as const },
        distance: { createdAt: "desc" as const }, // Will be sorted client-side
      }[sortBy];

      const listings = await ctx.prisma.marketplaceListing.findMany({
        where,
        orderBy,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        include: {
          report: {
            select: {
              type: true,
              valueEstimate: true,
              confidenceScore: true,
              generatedAt: true,
              appraisalRequest: {
                select: {
                  property: {
                    select: {
                      city: true,
                      county: true,
                      state: true,
                      propertyType: true,
                      latitude: true,
                      longitude: true,
                    },
                  },
                },
              },
            },
          },
          seller: {
            select: {
              name: true,
            },
          },
          documents: {
            select: {
              id: true,
              title: true,
              documentType: true,
            },
          },
          _count: {
            select: {
              purchases: true,
              documents: true,
            },
          },
        },
      });

      // If geographic search, calculate actual distances and filter precisely
      let filteredListings = listings;
      if (latitude !== undefined && longitude !== undefined) {
        filteredListings = listings.filter((listing) => {
          const listingLat =
            listing.latitude ||
            listing.report?.appraisalRequest?.property?.latitude;
          const listingLon =
            listing.longitude ||
            listing.report?.appraisalRequest?.property?.longitude;
          if (!listingLat || !listingLon) return false;
          const distance = calculateDistanceMiles(
            latitude,
            longitude,
            listingLat,
            listingLon,
          );
          return distance <= radiusMiles;
        });

        // Sort by distance if requested
        if (sortBy === "distance") {
          filteredListings.sort((a, b) => {
            const aLat =
              a.latitude || a.report?.appraisalRequest?.property?.latitude || 0;
            const aLon =
              a.longitude ||
              a.report?.appraisalRequest?.property?.longitude ||
              0;
            const bLat =
              b.latitude || b.report?.appraisalRequest?.property?.latitude || 0;
            const bLon =
              b.longitude ||
              b.report?.appraisalRequest?.property?.longitude ||
              0;
            const distA = calculateDistanceMiles(
              latitude,
              longitude,
              aLat,
              aLon,
            );
            const distB = calculateDistanceMiles(
              latitude,
              longitude,
              bLat,
              bLon,
            );
            return distA - distB;
          });
        }
      }

      let nextCursor: string | undefined;
      if (filteredListings.length > limit) {
        const nextItem = filteredListings.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: filteredListings,
        nextCursor,
      };
    }),

  /**
   * Get a single listing by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.id },
        include: {
          report: {
            select: {
              id: true,
              type: true,
              valueEstimate: true,
              valueRangeMin: true,
              valueRangeMax: true,
              confidenceScore: true,
              compsCount: true,
              generatedAt: true,
              appraisalRequest: {
                select: {
                  property: {
                    select: {
                      city: true,
                      county: true,
                      state: true,
                      zipCode: true,
                      propertyType: true,
                      yearBuilt: true,
                      sqft: true,
                      bedrooms: true,
                      bathrooms: true,
                    },
                  },
                },
              },
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              purchases: true,
            },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // Increment view count
      await ctx.prisma.marketplaceListing.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
      });

      return listing;
    }),

  /**
   * Create a new listing (from report or external study)
   */
  create: clientProcedure
    .input(
      z.object({
        // Optional - can create listing from report or as standalone study
        reportId: z.string().optional(),
        title: z.string().min(10).max(200),
        description: z.string().max(2000).optional(),
        category: z.string(),
        studyCategory: z
          .enum(STUDY_CATEGORY_VALUES)
          .default("APPRAISAL_REPORT"),
        price: z.number().min(1).max(100000), // Increased max for engineering studies
        // Location (required for standalone studies)
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        city: z.string().optional(),
        county: z.string().optional(),
        state: z.string().default("TX"),
        zipCode: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let locationData = {
        latitude: input.latitude,
        longitude: input.longitude,
        city: input.city,
        county: input.county,
        state: input.state,
        zipCode: input.zipCode,
      };

      // If reportId is provided, verify ownership
      if (input.reportId) {
        const report = await ctx.prisma.report.findUnique({
          where: { id: input.reportId },
          include: {
            appraisalRequest: {
              select: {
                organizationId: true,
                status: true,
                property: {
                  select: {
                    latitude: true,
                    longitude: true,
                    city: true,
                    county: true,
                    state: true,
                    zipCode: true,
                  },
                },
              },
            },
          },
        });

        if (!report) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Report not found",
          });
        }

        if (report.appraisalRequest?.organizationId !== ctx.organization!.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not own this report",
          });
        }

        if (report.appraisalRequest?.status !== "READY") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Report must be completed before listing",
          });
        }

        // Check if already listed
        const existingListing = await ctx.prisma.marketplaceListing.findFirst({
          where: {
            reportId: input.reportId,
            status: "ACTIVE",
          },
        });

        if (existingListing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This report is already listed",
          });
        }

        // Use property location if not provided
        const property = report.appraisalRequest?.property;
        if (property) {
          locationData = {
            latitude: input.latitude ?? property.latitude,
            longitude: input.longitude ?? property.longitude,
            city: input.city ?? property.city,
            county: input.county ?? property.county,
            state: input.state ?? property.state,
            zipCode: input.zipCode ?? property.zipCode,
          };
        }
      } else {
        // For standalone studies, location is required
        if (!input.county) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "County is required for external studies",
          });
        }
      }

      // Create the listing
      const listing = await ctx.prisma.marketplaceListing.create({
        data: {
          reportId: input.reportId,
          sellerId: ctx.organization!.id,
          title: input.title,
          description: input.description,
          category: input.category,
          studyCategory: input.studyCategory,
          price: input.price,
          ...locationData,
        },
        include: {
          report: {
            select: {
              type: true,
            },
          },
        },
      });

      return listing;
    }),

  /**
   * Upload a document to a listing
   */
  uploadDocument: clientProcedure
    .input(
      z.object({
        listingId: z.string(),
        title: z.string().min(3).max(200),
        description: z.string().max(1000).optional(),
        fileName: z.string(),
        fileSize: z.number(),
        fileUrl: z.string().url(),
        mimeType: z.string(),
        documentType: z.string(), // soil_report, drainage_plan, survey, etc.
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify listing ownership
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.sellerId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this listing",
        });
      }

      const document = await ctx.prisma.marketplaceDocument.create({
        data: {
          listingId: input.listingId,
          title: input.title,
          description: input.description,
          fileName: input.fileName,
          fileSize: input.fileSize,
          fileUrl: input.fileUrl,
          mimeType: input.mimeType,
          documentType: input.documentType,
          uploadedById: ctx.user.id,
        },
      });

      return document;
    }),

  /**
   * Remove a document from a listing
   */
  removeDocument: clientProcedure
    .input(z.object({ documentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.prisma.marketplaceDocument.findUnique({
        where: { id: input.documentId },
        include: {
          listing: {
            select: {
              sellerId: true,
            },
          },
        },
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      if (document.listing.sellerId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this document",
        });
      }

      await ctx.prisma.marketplaceDocument.delete({
        where: { id: input.documentId },
      });

      return { success: true };
    }),

  /**
   * Get documents for a listing
   */
  getDocuments: publicProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const documents = await ctx.prisma.marketplaceDocument.findMany({
        where: { listingId: input.listingId },
        orderBy: { uploadedAt: "desc" },
      });

      return documents;
    }),

  /**
   * Update a listing
   */
  update: clientProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(10).max(200).optional(),
        description: z.string().max(2000).optional(),
        price: z.number().min(1).max(10000).optional(),
        status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.sellerId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this listing",
        });
      }

      const updated = await ctx.prisma.marketplaceListing.update({
        where: { id: input.id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.price && { price: input.price }),
          ...(input.status && { status: input.status }),
        },
      });

      return updated;
    }),

  /**
   * Purchase a listing
   */
  purchase: clientProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.marketplaceListing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This listing is no longer available",
        });
      }

      // Can't buy your own listing
      if (listing.sellerId === ctx.organization!.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot purchase your own listing",
        });
      }

      // Check if already purchased
      const existingPurchase = await ctx.prisma.marketplacePurchase.findUnique({
        where: {
          listingId_buyerId: {
            listingId: input.listingId,
            buyerId: ctx.organization!.id,
          },
        },
      });

      if (existingPurchase) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already purchased this report",
        });
      }

      // Create purchase (in production, this would integrate with Stripe)
      const purchase = await ctx.prisma.marketplacePurchase.create({
        data: {
          listingId: input.listingId,
          buyerId: ctx.organization!.id,
          price: listing.price,
          paymentStatus: "COMPLETED", // Placeholder - would be PENDING until Stripe confirms
        },
      });

      // Update listing sold count
      await ctx.prisma.marketplaceListing.update({
        where: { id: input.listingId },
        data: { soldCount: { increment: 1 } },
      });

      return purchase;
    }),

  /**
   * Create Stripe checkout session for cart items
   */
  createCheckout: clientProcedure
    .input(z.object({ listingIds: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Fetch all listings
      const listings = await ctx.prisma.marketplaceListing.findMany({
        where: {
          id: { in: input.listingIds },
          status: "ACTIVE",
        },
        include: {
          report: {
            select: {
              type: true,
              appraisalRequest: {
                select: {
                  property: {
                    select: {
                      city: true,
                      state: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (listings.length !== input.listingIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "One or more listings are no longer available",
        });
      }

      // Check if buyer already owns any of these
      const existingPurchases = await ctx.prisma.marketplacePurchase.findMany({
        where: {
          listingId: { in: input.listingIds },
          buyerId: ctx.organization!.id,
        },
      });

      if (existingPurchases.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already purchased one or more of these reports",
        });
      }

      // Can't buy your own listings
      const ownListings = listings.filter(
        (l) => l.sellerId === ctx.organization!.id,
      );
      if (ownListings.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot purchase your own listings",
        });
      }

      // Calculate total
      const total = listings.reduce((sum, l) => sum + Number(l.price), 0);

      // Build line items for Stripe
      const lineItems = listings.map((listing) => {
        const property = listing.report?.appraisalRequest?.property;
        const reportType =
          listing.report?.type?.replace(/_/g, " ") ||
          listing.studyCategory?.replace(/_/g, " ") ||
          "Study";
        return {
          name: listing.title,
          description: property
            ? `${reportType} - ${property.city}, ${property.state}`
            : reportType,
          amount: Math.round(Number(listing.price) * 100), // Convert to cents
          quantity: 1,
        };
      });

      // Create Stripe checkout session
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutSession = await stripe.createMarketplaceCheckout({
        organizationId: ctx.organization!.id,
        listingIds: input.listingIds,
        lineItems,
        customerEmail: ctx.user.email || "",
        successUrl: `${baseUrl}/marketplace/cart?payment=success`,
        cancelUrl: `${baseUrl}/marketplace/cart?payment=cancelled`,
      });

      return {
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
        total,
      };
    }),

  /**
   * Confirm marketplace purchase after Stripe payment
   */
  confirmPurchase: clientProcedure
    .input(z.object({ listingIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const purchases: Awaited<
        ReturnType<typeof ctx.prisma.marketplacePurchase.create>
      >[] = [];

      for (const listingId of input.listingIds) {
        const listing = await ctx.prisma.marketplaceListing.findUnique({
          where: { id: listingId },
        });

        if (!listing) continue;

        // Check if already purchased
        const existing = await ctx.prisma.marketplacePurchase.findUnique({
          where: {
            listingId_buyerId: {
              listingId,
              buyerId: ctx.organization!.id,
            },
          },
        });

        if (existing) continue;

        // Create purchase record
        const purchase = await ctx.prisma.marketplacePurchase.create({
          data: {
            listingId,
            buyerId: ctx.organization!.id,
            price: listing.price,
            paymentStatus: "COMPLETED",
          },
        });

        // Update listing sold count
        await ctx.prisma.marketplaceListing.update({
          where: { id: listingId },
          data: { soldCount: { increment: 1 } },
        });

        purchases.push(purchase);
      }

      return purchases;
    }),

  /**
   * Get my listings (as seller)
   */
  myListings: clientProcedure
    .input(
      z.object({
        status: z.enum(["ACTIVE", "SOLD_OUT", "ARCHIVED"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, status } = input;

      const listings = await ctx.prisma.marketplaceListing.findMany({
        where: {
          sellerId: ctx.organization!.id,
          ...(status && { status }),
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        include: {
          report: {
            select: {
              type: true,
              valueEstimate: true,
              appraisalRequest: {
                select: {
                  property: {
                    select: {
                      city: true,
                      state: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              purchases: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (listings.length > limit) {
        const nextItem = listings.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: listings,
        nextCursor,
      };
    }),

  /**
   * Get my purchases (as buyer)
   */
  myPurchases: clientProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      const purchases = await ctx.prisma.marketplacePurchase.findMany({
        where: {
          buyerId: ctx.organization!.id,
          paymentStatus: "COMPLETED",
        },
        orderBy: { purchasedAt: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        include: {
          listing: {
            include: {
              report: {
                select: {
                  id: true,
                  type: true,
                  valueEstimate: true,
                  pdfUrl: true,
                  appraisalRequest: {
                    select: {
                      property: {
                        select: {
                          addressLine1: true,
                          city: true,
                          state: true,
                          zipCode: true,
                        },
                      },
                    },
                  },
                },
              },
              seller: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (purchases.length > limit) {
        const nextItem = purchases.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items: purchases,
        nextCursor,
      };
    }),

  /**
   * Download a purchased report or documents
   */
  download: clientProcedure
    .input(z.object({ purchaseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const purchase = await ctx.prisma.marketplacePurchase.findUnique({
        where: { id: input.purchaseId },
        include: {
          listing: {
            include: {
              report: {
                select: {
                  pdfUrl: true,
                },
              },
              documents: {
                select: {
                  id: true,
                  title: true,
                  fileUrl: true,
                  documentType: true,
                },
              },
            },
          },
        },
      });

      if (!purchase) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Purchase not found",
        });
      }

      if (purchase.buyerId !== ctx.organization!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this purchase",
        });
      }

      if (purchase.paymentStatus !== "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment not completed",
        });
      }

      // Update download count
      await ctx.prisma.marketplacePurchase.update({
        where: { id: input.purchaseId },
        data: {
          downloadCount: { increment: 1 },
          lastDownloadAt: new Date(),
        },
      });

      // Return report URL if available, otherwise return documents
      return {
        downloadUrl: purchase.listing.report?.pdfUrl || null,
        documents: purchase.listing.documents,
      };
    }),

  /**
   * Get marketplace stats
   */
  stats: publicProcedure.query(async ({ ctx }) => {
    const [totalListings, totalSales, featuredListings] = await Promise.all([
      ctx.prisma.marketplaceListing.count({
        where: { status: "ACTIVE" },
      }),
      ctx.prisma.marketplacePurchase.count({
        where: { paymentStatus: "COMPLETED" },
      }),
      ctx.prisma.marketplaceListing.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        take: 4,
        orderBy: { featuredAt: "desc" },
        include: {
          report: {
            select: {
              type: true,
              valueEstimate: true,
              appraisalRequest: {
                select: {
                  property: {
                    select: {
                      city: true,
                      state: true,
                      propertyType: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      totalListings,
      totalSales,
      featuredListings,
    };
  }),
});
