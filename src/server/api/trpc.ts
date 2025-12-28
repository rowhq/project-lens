/**
 * tRPC Server Configuration
 * Project LENS - Texas V1
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/db/prisma";

/**
 * Context creation for each request
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { userId } = await auth();

  return {
    prisma,
    userId,
    headers: opts.headers,
  };
};

/**
 * Initialize tRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Router and procedure helpers
 */
export const createTRPCRouter = t.router;

/**
 * Public procedure - no auth required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Get user from database
  const user = await ctx.prisma.user.findUnique({
    where: { externalAuthId: ctx.userId },
    include: { organization: true },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found in database",
    });
  }

  if (user.status !== "ACTIVE") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User account is not active",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
      organization: user.organization,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN" && ctx.user.role !== "SUPER_ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

/**
 * Appraiser procedure - requires appraiser role
 */
export const appraiserProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.user.role !== "APPRAISER") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Appraiser access required",
      });
    }

    // Get appraiser profile
    const appraiserProfile = await ctx.prisma.appraiserProfile.findUnique({
      where: { userId: ctx.user.id },
    });

    if (!appraiserProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Appraiser profile not found",
      });
    }

    return next({
      ctx: {
        ...ctx,
        appraiserProfile,
      },
    });
  }
);

/**
 * Client procedure - requires client role with organization
 */
export const clientProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "CLIENT") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Client access required",
    });
  }

  if (!ctx.organization) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organization membership required",
    });
  }

  return next({ ctx });
});
