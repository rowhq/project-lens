/**
 * Marketplace Router
 * Handles DD Marketplace operations for buying/selling reports
 */

import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  clientProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const marketplaceRouter = createTRPCRouter({
  /**
   * List marketplace listings with filters
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "popular"]).default("newest"),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, category, minPrice, maxPrice, sortBy, search } = input;

      const where = {
        status: "ACTIVE" as const,
        ...(category && { category }),
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
   * Create a new listing from a completed report
   */
  create: clientProcedure
    .input(
      z.object({
        reportId: z.string(),
        title: z.string().min(10).max(200),
        description: z.string().max(2000).optional(),
        category: z.string(),
        price: z.number().min(1).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the report exists and belongs to the organization
      const report = await ctx.prisma.report.findUnique({
        where: { id: input.reportId },
        include: {
          appraisalRequest: {
            select: {
              organizationId: true,
              status: true,
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

      // Create the listing
      const listing = await ctx.prisma.marketplaceListing.create({
        data: {
          reportId: input.reportId,
          sellerId: ctx.organization!.id,
          title: input.title,
          description: input.description,
          category: input.category,
          price: input.price,
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
      })
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
          ...(input.description !== undefined && { description: input.description }),
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
   * Get my listings (as seller)
   */
  myListings: clientProcedure
    .input(
      z.object({
        status: z.enum(["ACTIVE", "SOLD_OUT", "ARCHIVED"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      })
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
      })
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
   * Download a purchased report
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

      return {
        downloadUrl: purchase.listing.report.pdfUrl,
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
