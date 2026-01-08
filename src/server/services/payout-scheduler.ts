/**
 * Payout Scheduler
 * Automated payout processing for appraiser earnings
 * Designed to be run by a cron job (e.g., every Monday at 6 AM)
 */

import { prisma } from "@/server/db/prisma";

// Payout configuration
export const PAYOUT_CONFIG = {
  // Minimum amount required for automatic payout
  minimumPayoutAmount: 25,
  // Maximum single payout (for fraud protection)
  maximumPayoutAmount: 10000,
  // Days since last payout before auto-payout (7 = weekly)
  payoutIntervalDays: 7,
  // Day of week for scheduled payouts (0 = Sunday, 1 = Monday)
  scheduledPayoutDay: 1,
  // Hour of day for scheduled payouts (24-hour format)
  scheduledPayoutHour: 6,
};

interface PayoutResult {
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  paymentsCount: number;
  status: "PROCESSED" | "SKIPPED" | "FAILED";
  reason?: string;
}

interface SchedulerResult {
  success: boolean;
  processedCount: number;
  totalAmount: number;
  results: PayoutResult[];
  errors: string[];
}

/**
 * Get all users with pending payouts
 */
async function getUsersWithPendingPayouts(): Promise<
  Array<{
    userId: string;
    userEmail: string;
    userName: string;
    pendingAmount: number;
    paymentsCount: number;
    paymentIds: string[];
  }>
> {
  // Get all pending payments grouped by user
  const pendingPayments = await prisma.payment.findMany({
    where: {
      type: "JOB_PAYOUT",
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Group by user
  const userPayments = new Map<
    string,
    {
      userId: string;
      userEmail: string;
      userName: string;
      pendingAmount: number;
      paymentsCount: number;
      paymentIds: string[];
    }
  >();

  for (const payment of pendingPayments) {
    // Skip payments without userId
    if (!payment.userId) continue;

    const userId = payment.userId;
    const existing = userPayments.get(userId);
    const amount = Number(payment.amount);

    if (existing) {
      existing.pendingAmount += amount;
      existing.paymentsCount++;
      existing.paymentIds.push(payment.id);
    } else {
      const user = payment.user;
      userPayments.set(userId, {
        userId,
        userEmail: user?.email || "",
        userName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        pendingAmount: amount,
        paymentsCount: 1,
        paymentIds: [payment.id],
      });
    }
  }

  return Array.from(userPayments.values());
}

/**
 * Process payout for a single user
 */
async function processUserPayout(
  userId: string,
  paymentIds: string[],
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify user has payout method configured
    const appraiserProfile = await prisma.appraiserProfile.findUnique({
      where: { userId },
      select: { stripeConnectId: true },
    });

    if (!appraiserProfile?.stripeConnectId) {
      return {
        success: false,
        error: "No payout method configured",
      };
    }

    // In production, this would initiate a Stripe transfer
    // For now, we just mark payments as PROCESSING
    await prisma.payment.updateMany({
      where: {
        id: { in: paymentIds },
        status: "PENDING", // Safety check
      },
      data: {
        status: "PROCESSING",
      },
    });

    // Create a payout record
    await prisma.payment.create({
      data: {
        userId,
        type: "PAYOUT",
        amount,
        status: "PROCESSING",
        description: `Scheduled payout - ${paymentIds.length} jobs`,
      },
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

/**
 * Run the automated payout scheduler
 * This should be called by a cron job on the scheduled day
 */
export async function runPayoutScheduler(): Promise<SchedulerResult> {
  const results: PayoutResult[] = [];
  const errors: string[] = [];
  let processedCount = 0;
  let totalAmount = 0;

  console.log("[PayoutScheduler] Starting scheduled payout run...");

  try {
    // Get all users with pending payouts
    const usersWithPayouts = await getUsersWithPendingPayouts();

    console.log(
      `[PayoutScheduler] Found ${usersWithPayouts.length} users with pending payouts`,
    );

    for (const user of usersWithPayouts) {
      let status: PayoutResult["status"] = "SKIPPED";
      let reason: string | undefined;

      // Check minimum amount
      if (user.pendingAmount < PAYOUT_CONFIG.minimumPayoutAmount) {
        status = "SKIPPED";
        reason = `Below minimum ($${PAYOUT_CONFIG.minimumPayoutAmount})`;
      }
      // Check maximum amount (fraud protection)
      else if (user.pendingAmount > PAYOUT_CONFIG.maximumPayoutAmount) {
        status = "SKIPPED";
        reason = `Exceeds maximum ($${PAYOUT_CONFIG.maximumPayoutAmount}) - requires manual review`;
        errors.push(
          `User ${user.userId}: Payout of $${user.pendingAmount} exceeds limit`,
        );
      }
      // Process payout
      else {
        const result = await processUserPayout(
          user.userId,
          user.paymentIds,
          user.pendingAmount,
        );

        if (result.success) {
          status = "PROCESSED";
          processedCount++;
          totalAmount += user.pendingAmount;
        } else {
          status = "FAILED";
          reason = result.error;
          errors.push(`User ${user.userId}: ${result.error}`);
        }
      }

      results.push({
        userId: user.userId,
        userEmail: user.userEmail,
        userName: user.userName,
        amount: user.pendingAmount,
        paymentsCount: user.paymentsCount,
        status,
        reason,
      });
    }

    console.log(
      `[PayoutScheduler] Completed: ${processedCount} payouts, $${totalAmount.toFixed(2)} total`,
    );

    return {
      success: true,
      processedCount,
      totalAmount,
      results,
      errors,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[PayoutScheduler] Fatal error:", errorMessage);

    return {
      success: false,
      processedCount: 0,
      totalAmount: 0,
      results,
      errors: [errorMessage, ...errors],
    };
  }
}

/**
 * Check if today is a scheduled payout day
 */
export function isScheduledPayoutDay(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  return (
    dayOfWeek === PAYOUT_CONFIG.scheduledPayoutDay &&
    hour >= PAYOUT_CONFIG.scheduledPayoutHour
  );
}

/**
 * Get next scheduled payout date
 */
export function getNextScheduledPayoutDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilPayout =
    (PAYOUT_CONFIG.scheduledPayoutDay - dayOfWeek + 7) % 7 || 7;

  const nextPayout = new Date(now);
  nextPayout.setDate(nextPayout.getDate() + daysUntilPayout);
  nextPayout.setHours(PAYOUT_CONFIG.scheduledPayoutHour, 0, 0, 0);

  return nextPayout;
}

/**
 * Get payout statistics
 */
export async function getPayoutStats(): Promise<{
  pendingPayouts: number;
  pendingAmount: number;
  processingPayouts: number;
  processingAmount: number;
  completedThisMonth: number;
  completedAmountThisMonth: number;
  nextScheduledPayout: Date;
}> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [pending, processing, completedThisMonth] = await Promise.all([
    prisma.payment.aggregate({
      where: { type: "JOB_PAYOUT", status: "PENDING" },
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { type: "JOB_PAYOUT", status: "PROCESSING" },
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        type: "PAYOUT",
        status: "COMPLETED",
        processedAt: { gte: monthStart },
      },
      _count: true,
      _sum: { amount: true },
    }),
  ]);

  return {
    pendingPayouts: pending._count || 0,
    pendingAmount: Number(pending._sum.amount || 0),
    processingPayouts: processing._count || 0,
    processingAmount: Number(processing._sum.amount || 0),
    completedThisMonth: completedThisMonth._count || 0,
    completedAmountThisMonth: Number(completedThisMonth._sum.amount || 0),
    nextScheduledPayout: getNextScheduledPayoutDate(),
  };
}
