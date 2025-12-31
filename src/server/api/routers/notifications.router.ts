/**
 * Notifications Router
 * Handles push notification subscriptions and sending
 */

import { z } from "zod";
import { createTRPCRouter } from "../trpc";
import { protectedProcedure } from "../trpc";
import webpush from "web-push";
import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { calculateDistanceMiles as calculateDistance } from "@/shared/lib/geo";

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:support@projectlens.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Type for push subscription stored in JSON
interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  subscribedAt: string;
  [key: string]: string | { p256dh: string; auth: string }; // Index signature for Prisma JSON compatibility
}

export const notificationsRouter = createTRPCRouter({
  /**
   * Save push subscription for a user
   */
  savePushSubscription: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscriptionData: PushSubscriptionData = {
        endpoint: input.endpoint,
        keys: input.keys,
        subscribedAt: new Date().toISOString(),
      };

      // Upsert notification preferences with push subscription
      await ctx.prisma.notificationPreferences.upsert({
        where: { userId: ctx.user.id },
        update: {
          pushSubscription: subscriptionData,
        },
        create: {
          userId: ctx.user.id,
          pushSubscription: subscriptionData,
        },
      });

      return { success: true };
    }),

  /**
   * Remove push subscription for a user
   */
  removePushSubscription: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current preferences
      const prefs = await ctx.prisma.notificationPreferences.findUnique({
        where: { userId: ctx.user.id },
        select: { pushSubscription: true },
      });

      const subscription = prefs?.pushSubscription as PushSubscriptionData | null;

      // Only remove if endpoint matches
      if (subscription?.endpoint === input.endpoint) {
        await ctx.prisma.notificationPreferences.update({
          where: { userId: ctx.user.id },
          data: { pushSubscription: Prisma.DbNull },
        });
      }

      return { success: true };
    }),

  /**
   * Get push notification status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const prefs = await ctx.prisma.notificationPreferences.findUnique({
      where: { userId: ctx.user.id },
      select: { pushSubscription: true },
    });

    const subscription = prefs?.pushSubscription as PushSubscriptionData | null;

    return {
      isSubscribed: !!subscription?.endpoint,
      subscribedAt: subscription?.subscribedAt || null,
    };
  }),
});

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  prisma: PrismaClient,
  userId: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    data?: Record<string, unknown>;
  }
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log("Push notifications not configured (missing VAPID keys)");
    return { sent: false, reason: "not_configured" };
  }

  try {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
      select: { pushSubscription: true },
    });

    const subscription = prefs?.pushSubscription as PushSubscriptionData | null;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return { sent: false, reason: "no_subscription" };
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(notification)
    );

    return { sent: true };
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return { sent: false, reason: "send_failed", error };
  }
}

/**
 * Send push notification to all appraisers in a geographic area
 */
export async function notifyAppraisersOfNewJob(
  prisma: PrismaClient,
  job: {
    id: string;
    property: {
      addressLine1: string;
      city: string;
      latitude: number;
      longitude: number;
    };
    payoutAmount: number;
  },
  radiusMiles: number = 50
) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log("Push notifications not configured");
    return { notified: 0 };
  }

  try {
    // Get all verified appraisers with their notification preferences
    const appraisers = await prisma.appraiserProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
      },
      include: {
        user: {
          include: {
            notificationPreferences: true,
          },
        },
      },
    });

    let notified = 0;

    for (const appraiser of appraisers) {
      // Check if push notifications are enabled
      if (!appraiser.user.notificationPreferences?.pushUrgent) {
        continue;
      }

      // Check if within coverage radius
      if (appraiser.homeBaseLat && appraiser.homeBaseLng) {
        const distance = calculateDistance(
          appraiser.homeBaseLat,
          appraiser.homeBaseLng,
          job.property.latitude,
          job.property.longitude
        );

        const coverageRadius = appraiser.coverageRadiusMiles || radiusMiles;
        if (distance > coverageRadius) {
          continue;
        }
      }

      // Send notification
      const result = await sendPushNotification(prisma, appraiser.user.id, {
        title: "New Job Available",
        body: `$${job.payoutAmount} - ${job.property.addressLine1}, ${job.property.city}`,
        icon: "/icons/icon-192x192.png",
        data: {
          url: `/appraiser/jobs/${job.id}`,
          jobId: job.id,
        },
      });

      if (result.sent) {
        notified++;
      }
    }

    return { notified };
  } catch (error) {
    console.error("Failed to notify appraisers:", error);
    return { notified: 0, error };
  }
}

