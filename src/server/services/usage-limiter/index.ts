/**
 * Usage Limiter Service
 * Checks and enforces monthly report limits based on organization plan
 */

import { prisma } from "@/server/db/prisma";
import { SUBSCRIPTION_PLANS } from "@/shared/config/constants";

export interface UsageStatus {
  /** Current plan name */
  plan: string;
  /** Reports used this month */
  used: number;
  /** Total allowed per month (-1 = unlimited) */
  limit: number;
  /** Reports remaining (null if unlimited) */
  remaining: number | null;
  /** Whether the limit has been exceeded */
  exceeded: boolean;
  /** Whether the plan has unlimited reports */
  unlimited: boolean;
  /** Billing period start */
  periodStart: Date;
  /** Billing period end */
  periodEnd: Date;
}

/**
 * Get the reports limit for a given plan
 */
function getPlanLimit(plan: string): number {
  // Map database plan enum to constants
  const planKey = plan === "FREE_TRIAL" ? "STARTER" : plan;
  const planConfig =
    SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];
  return planConfig?.reportsPerMonth ?? 5; // Default to 5 if not found
}

/**
 * Get the start and end of the current billing month
 */
function getBillingPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { start, end };
}

/**
 * Get current usage status for an organization
 */
export async function getUsageStatus(
  organizationId: string,
): Promise<UsageStatus> {
  // Get organization plan
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const { start, end } = getBillingPeriod();
  const limit = getPlanLimit(org.plan);
  const unlimited = limit === -1;

  // Count AI reports created this month
  const used = await prisma.appraisalRequest.count({
    where: {
      organizationId,
      requestedType: "AI_REPORT",
      createdAt: {
        gte: start,
        lte: end,
      },
      // Only count successful/processing ones, not failed
      status: {
        in: ["QUEUED", "RUNNING", "READY"],
      },
    },
  });

  return {
    plan: org.plan,
    used,
    limit,
    remaining: unlimited ? null : Math.max(0, limit - used),
    exceeded: !unlimited && used >= limit,
    unlimited,
    periodStart: start,
    periodEnd: end,
  };
}

/**
 * Check if organization can create a new AI report
 * Returns true if allowed, false if limit exceeded
 */
export async function canCreateReport(
  organizationId: string,
): Promise<boolean> {
  const status = await getUsageStatus(organizationId);
  return !status.exceeded;
}

/**
 * Check usage and return detailed info for payment decision
 */
export async function checkUsageForPayment(organizationId: string): Promise<{
  requiresPayment: boolean;
  usageStatus: UsageStatus;
}> {
  const usageStatus = await getUsageStatus(organizationId);

  return {
    requiresPayment: usageStatus.exceeded,
    usageStatus,
  };
}
