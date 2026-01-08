/**
 * User Router
 * Handles user profile, notification preferences, and avatar uploads
 */

import { z } from "zod";
import { compare, hash } from "bcryptjs";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { getUploadUrl, generateProfilePhotoKey } from "@/shared/lib/storage";

export const userRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        notificationPreferences: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return user;
  }),

  /**
   * Update user profile (firstName, lastName, jobTitle, location)
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        jobTitle: z.string().max(100).optional().nullable(),
        location: z.string().max(100).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          ...(input.firstName !== undefined && { firstName: input.firstName }),
          ...(input.lastName !== undefined && { lastName: input.lastName }),
          ...(input.jobTitle !== undefined && { jobTitle: input.jobTitle }),
          ...(input.location !== undefined && { location: input.location }),
        },
      });

      return updatedUser;
    }),

  /**
   * Get notification preferences
   */
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.prisma.notificationPreferences.findUnique({
      where: { userId: ctx.user.id },
    });

    // Return default preferences if none exist
    if (!prefs) {
      return {
        emailReportReady: true,
        emailStatusUpdate: true,
        emailTeamActivity: true,
        emailBilling: true,
        emailMarketing: false,
        pushUrgent: true,
        pushReports: true,
      };
    }

    return prefs;
  }),

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        emailReportReady: z.boolean().optional(),
        emailStatusUpdate: z.boolean().optional(),
        emailTeamActivity: z.boolean().optional(),
        emailBilling: z.boolean().optional(),
        emailMarketing: z.boolean().optional(),
        pushUrgent: z.boolean().optional(),
        pushReports: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert notification preferences
      const prefs = await ctx.prisma.notificationPreferences.upsert({
        where: { userId: ctx.user.id },
        create: {
          userId: ctx.user.id,
          emailReportReady: input.emailReportReady ?? true,
          emailStatusUpdate: input.emailStatusUpdate ?? true,
          emailTeamActivity: input.emailTeamActivity ?? true,
          emailBilling: input.emailBilling ?? true,
          emailMarketing: input.emailMarketing ?? false,
          pushUrgent: input.pushUrgent ?? true,
          pushReports: input.pushReports ?? true,
        },
        update: input,
      });

      return prefs;
    }),

  /**
   * Get presigned URL for avatar upload
   */
  getAvatarUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z
          .string()
          .refine(
            (type) =>
              ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
                type,
              ),
            { message: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" },
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const key = generateProfilePhotoKey({
        userId: ctx.user.id,
        filename: input.filename,
      });

      const result = await getUploadUrl({
        key,
        contentType: input.contentType,
        expiresIn: 3600, // 1 hour
      });

      return {
        uploadUrl: result.uploadUrl,
        publicUrl: result.publicUrl,
        key: result.key,
      };
    }),

  /**
   * Update avatar URL after successful upload
   */
  updateAvatarUrl: protectedProcedure
    .input(
      z.object({
        avatarUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { avatarUrl: input.avatarUrl },
      });

      return updatedUser;
    }),

  /**
   * Remove avatar
   */
  removeAvatar: protectedProcedure.mutation(async ({ ctx }) => {
    const updatedUser = await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: { avatarUrl: null },
    });

    return updatedUser;
  }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { password: true },
      });

      if (!user?.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No password set for this account",
        });
      }

      // Verify current password
      const isValid = await compare(input.currentPassword, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      // Hash and update new password
      const hashedPassword = await hash(input.newPassword, 12);
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),
});
