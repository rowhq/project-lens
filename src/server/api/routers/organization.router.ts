/**
 * Organization Router
 * Handles organization and team management
 */

import { z } from "zod";
import { createTRPCRouter, clientProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { sendTeamInvitation } from "@/shared/lib/resend";
import { randomBytes } from "crypto";

export const organizationRouter = createTRPCRouter({
  /**
   * Get organization details
   */
  get: clientProcedure.query(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.organization!.id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            appraisalRequests: true,
            jobs: true,
          },
        },
      },
    });

    return org;
  }),

  /**
   * Update organization
   */
  update: clientProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        billingEmail: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.organization.update({
        where: { id: ctx.organization!.id },
        data: input,
      });
    }),

  /**
   * Team member management
   */
  members: createTRPCRouter({
    list: clientProcedure.query(async ({ ctx }) => {
      return ctx.prisma.user.findMany({
        where: { organizationId: ctx.organization!.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          avatarUrl: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "asc" },
      });
    }),

    invite: clientProcedure
      .input(
        z.object({
          email: z.string().email(),
          firstName: z.string(),
          lastName: z.string(),
          role: z.enum(["CLIENT"]).default("CLIENT"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check seat limit
        const memberCount = await ctx.prisma.user.count({
          where: { organizationId: ctx.organization!.id },
        });

        if (memberCount >= ctx.organization!.seats) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Organization seat limit reached",
          });
        }

        // Check if user already exists
        const existing = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });

        if (existing) {
          if (existing.organizationId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "User already belongs to an organization",
            });
          }

          // Add existing user to organization
          return ctx.prisma.user.update({
            where: { id: existing.id },
            data: {
              organizationId: ctx.organization!.id,
              status: "ACTIVE",
            },
          });
        }

        // Generate invite token
        const inviteToken = randomBytes(32).toString("hex");

        // Create new user with pending status
        const user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            role: input.role,
            status: "PENDING",
            organizationId: ctx.organization!.id,
          },
        });

        // Send invitation email
        try {
          await sendTeamInvitation({
            email: input.email,
            inviterName: `${ctx.user.firstName} ${ctx.user.lastName}`,
            organizationName: ctx.organization!.name,
            role: input.role,
            inviteToken,
          });
        } catch (error) {
          console.error("Failed to send invitation email:", error);
          // Don't fail the mutation if email fails
        }

        return user;
      }),

    remove: clientProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot remove yourself",
          });
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
        });

        if (!user || user.organizationId !== ctx.organization!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return ctx.prisma.user.update({
          where: { id: input.userId },
          data: {
            organizationId: null,
            status: "INACTIVE",
          },
        });
      }),

    updateRole: clientProcedure
      .input(
        z.object({
          userId: z.string(),
          role: z.enum(["CLIENT"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
        });

        if (!user || user.organizationId !== ctx.organization!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return ctx.prisma.user.update({
          where: { id: input.userId },
          data: { role: input.role },
        });
      }),

    /**
     * Change member role (alias for updateRole with extended role options)
     */
    changeRole: clientProcedure
      .input(
        z.object({
          userId: z.string(),
          role: z.enum(["CLIENT", "ADMIN"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Cannot change own role
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot change your own role",
          });
        }

        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
        });

        if (!user || user.organizationId !== ctx.organization!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return ctx.prisma.user.update({
          where: { id: input.userId },
          data: { role: input.role },
        });
      }),

    /**
     * Get pending invitations (users with PENDING status)
     */
    pending: clientProcedure.query(async ({ ctx }) => {
      return ctx.prisma.user.findMany({
        where: {
          organizationId: ctx.organization!.id,
          status: "PENDING",
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

    /**
     * Resend invitation email
     */
    resendInvite: clientProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
        });

        if (!user || user.organizationId !== ctx.organization!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (user.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not pending invitation",
          });
        }

        // Generate new invite token
        const inviteToken = randomBytes(32).toString("hex");

        // Send invitation email
        try {
          await sendTeamInvitation({
            email: user.email,
            inviterName: `${ctx.user.firstName} ${ctx.user.lastName}`,
            organizationName: ctx.organization!.name,
            role: user.role,
            inviteToken,
          });
        } catch (error) {
          console.error("Failed to send invitation email:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send invitation email",
          });
        }

        return { success: true };
      }),

    /**
     * Cancel pending invitation
     */
    cancelInvite: clientProcedure
      .input(z.object({ userId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
        });

        if (!user || user.organizationId !== ctx.organization!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (user.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not pending invitation",
          });
        }

        // Delete the pending user
        await ctx.prisma.user.delete({
          where: { id: input.userId },
        });

        return { success: true };
      }),
  }),

  /**
   * Organization stats
   */
  stats: clientProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAppraisals,
      monthlyAppraisals,
      activeJobs,
      completedJobs,
    ] = await Promise.all([
      ctx.prisma.appraisalRequest.count({
        where: { organizationId: ctx.organization!.id },
      }),
      ctx.prisma.appraisalRequest.count({
        where: {
          organizationId: ctx.organization!.id,
          createdAt: { gte: startOfMonth },
        },
      }),
      ctx.prisma.job.count({
        where: {
          organizationId: ctx.organization!.id,
          status: { in: ["ACCEPTED", "IN_PROGRESS", "SUBMITTED"] },
        },
      }),
      ctx.prisma.job.count({
        where: {
          organizationId: ctx.organization!.id,
          status: "COMPLETED",
        },
      }),
    ]);

    return {
      totalAppraisals,
      monthlyAppraisals,
      activeJobs,
      completedJobs,
    };
  }),

  /**
   * Create organization (for new users)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        billingEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.organizationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already belongs to an organization",
        });
      }

      // Generate unique slug
      const baseSlug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      let slug = baseSlug;
      let counter = 1;
      while (await ctx.prisma.organization.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const org = await ctx.prisma.organization.create({
        data: {
          name: input.name,
          slug,
          billingEmail: input.billingEmail || ctx.user.email,
        },
      });

      // Add user to organization
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          organizationId: org.id,
          status: "ACTIVE",
        },
      });

      return org;
    }),
});
