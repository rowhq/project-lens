/**
 * Dispatch Engine
 * Matches jobs with available appraisers
 */

import { prisma } from "@/server/db/prisma";
import { matcher } from "./matcher";
import { geofencing } from "./geofencing";
import { slaMonitor } from "./sla-monitor";
import { sendJobAssignment } from "@/shared/lib/resend";
import { sendPushNotification } from "@/server/api/routers/notifications.router";
import type { Job, AppraiserProfile, User, Property } from "@prisma/client";

export interface DispatchResult {
  success: boolean;
  jobId: string;
  matchedAppraisers: MatchedAppraiser[];
  dispatchedTo?: string;
  message: string;
}

export interface MatchedAppraiser {
  userId: string;
  profile: AppraiserProfile & { user: User };
  distance: number;
  score: number;
  estimatedArrival: number; // minutes
}

export interface DispatchOptions {
  maxRadius?: number; // miles
  urgency?: "NORMAL" | "URGENT" | "CRITICAL";
  preferredAppraisers?: string[];
  excludeAppraisers?: string[];
  requireBankPanel?: string;
}

/**
 * Dispatch engine class
 */
class DispatchEngine {
  /**
   * Dispatch a job to available appraisers
   */
  async dispatch(
    jobId: string,
    options: DispatchOptions = {}
  ): Promise<DispatchResult> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { property: true },
    });

    if (!job) {
      return {
        success: false,
        jobId,
        matchedAppraisers: [],
        message: "Job not found",
      };
    }

    if (job.status !== "PENDING_DISPATCH") {
      return {
        success: false,
        jobId,
        matchedAppraisers: [],
        message: `Job is not pending dispatch (status: ${job.status})`,
      };
    }

    // Find matching appraisers
    const matchedAppraisers = await matcher.findMatches(job, options);

    if (matchedAppraisers.length === 0) {
      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: {
          statusHistory: {
            push: {
              status: "NO_MATCHES",
              timestamp: new Date().toISOString(),
              message: "No available appraisers found",
            },
          },
        },
      });

      return {
        success: false,
        jobId,
        matchedAppraisers: [],
        message: "No available appraisers found within range",
      };
    }

    // Update job to dispatched status
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "DISPATCHED",
        dispatchedAt: new Date(),
        statusHistory: {
          push: {
            status: "DISPATCHED",
            timestamp: new Date().toISOString(),
            matchedCount: matchedAppraisers.length,
          },
        },
      },
    });

    // Send notifications to matched appraisers
    await this.notifyAppraisers(job, matchedAppraisers);

    return {
      success: true,
      jobId,
      matchedAppraisers,
      message: `Job dispatched to ${matchedAppraisers.length} appraisers`,
    };
  }

  /**
   * Auto-assign job to best available appraiser
   */
  async autoAssign(
    jobId: string,
    options: DispatchOptions = {}
  ): Promise<DispatchResult> {
    const dispatchResult = await this.dispatch(jobId, options);

    if (!dispatchResult.success || dispatchResult.matchedAppraisers.length === 0) {
      return dispatchResult;
    }

    // Select best match
    const bestMatch = dispatchResult.matchedAppraisers[0];

    // Assign job
    await prisma.job.update({
      where: { id: jobId },
      data: {
        assignedAppraiserId: bestMatch.userId,
        status: "ACCEPTED",
        acceptedAt: new Date(),
        statusHistory: {
          push: {
            status: "AUTO_ASSIGNED",
            timestamp: new Date().toISOString(),
            appraiserId: bestMatch.userId,
            score: bestMatch.score,
          },
        },
      },
    });

    return {
      ...dispatchResult,
      dispatchedTo: bestMatch.userId,
      message: `Job auto-assigned to appraiser`,
    };
  }

  /**
   * Reassign job to a different appraiser
   */
  async reassign(
    jobId: string,
    newAppraiserId: string | null,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return { success: false, message: "Job not found" };
    }

    if (newAppraiserId) {
      // Verify new appraiser is verified
      const appraiser = await prisma.appraiserProfile.findUnique({
        where: { userId: newAppraiserId },
      });

      if (!appraiser || appraiser.verificationStatus !== "VERIFIED") {
        return { success: false, message: "Appraiser not verified" };
      }

      await prisma.job.update({
        where: { id: jobId },
        data: {
          assignedAppraiserId: newAppraiserId,
          status: "ACCEPTED",
          acceptedAt: new Date(),
          statusHistory: {
            push: {
              status: "REASSIGNED",
              timestamp: new Date().toISOString(),
              previousAppraiserId: job.assignedAppraiserId,
              newAppraiserId,
              reason,
            },
          },
        },
      });
    } else {
      // Unassign and re-dispatch
      await prisma.job.update({
        where: { id: jobId },
        data: {
          assignedAppraiserId: null,
          status: "PENDING_DISPATCH",
          acceptedAt: null,
          statusHistory: {
            push: {
              status: "UNASSIGNED",
              timestamp: new Date().toISOString(),
              previousAppraiserId: job.assignedAppraiserId,
              reason,
            },
          },
        },
      });
    }

    return { success: true, message: "Job reassigned successfully" };
  }

  /**
   * Check and escalate SLA breaches
   */
  async checkSLAs(): Promise<{ breached: number; escalated: number }> {
    return slaMonitor.checkAndEscalate();
  }

  /**
   * Get dispatch stats
   */
  async getStats(): Promise<{
    pendingJobs: number;
    dispatchedJobs: number;
    activeJobs: number;
    slaBreaches: number;
    avgDispatchTime: number;
    avgAcceptanceTime: number;
  }> {
    const now = new Date();

    const [pending, dispatched, active, breached] = await Promise.all([
      prisma.job.count({ where: { status: "PENDING_DISPATCH" } }),
      prisma.job.count({ where: { status: "DISPATCHED" } }),
      prisma.job.count({
        where: { status: { in: ["ACCEPTED", "IN_PROGRESS"] } },
      }),
      prisma.job.count({
        where: {
          status: { in: ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"] },
          slaDueAt: { lt: now },
        },
      }),
    ]);

    // Calculate average times from recent jobs
    const recentJobs = await prisma.job.findMany({
      where: {
        dispatchedAt: { not: null },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      take: 100,
    });

    let totalDispatchTime = 0;
    let totalAcceptanceTime = 0;
    let dispatchCount = 0;
    let acceptCount = 0;

    for (const job of recentJobs) {
      if (job.dispatchedAt) {
        totalDispatchTime +=
          job.dispatchedAt.getTime() - job.createdAt.getTime();
        dispatchCount++;
      }
      if (job.dispatchedAt && job.acceptedAt) {
        totalAcceptanceTime +=
          job.acceptedAt.getTime() - job.dispatchedAt.getTime();
        acceptCount++;
      }
    }

    return {
      pendingJobs: pending,
      dispatchedJobs: dispatched,
      activeJobs: active,
      slaBreaches: breached,
      avgDispatchTime:
        dispatchCount > 0
          ? Math.round(totalDispatchTime / dispatchCount / 60000)
          : 0,
      avgAcceptanceTime:
        acceptCount > 0
          ? Math.round(totalAcceptanceTime / acceptCount / 60000)
          : 0,
    };
  }

  /**
   * Notify matched appraisers about available job
   */
  private async notifyAppraisers(
    job: Job & { property: Property },
    appraisers: MatchedAppraiser[]
  ): Promise<void> {
    // Create notifications for each appraiser
    const notifications = appraisers.map((appraiser) => ({
      userId: appraiser.userId,
      type: "JOB_AVAILABLE",
      title: "New Job Available",
      body: `New ${job.jobType} job available ${appraiser.distance.toFixed(1)} miles away`,
      data: {
        jobId: job.id,
        jobType: job.jobType,
        distance: appraiser.distance,
        payout: job.payoutAmount,
      },
      channel: "in_app",
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    // Send email and push notifications to appraisers
    for (const appraiser of appraisers) {
      try {
        // Send email notification
        await sendJobAssignment({
          email: appraiser.profile.user.email || "",
          appraiserName: appraiser.profile.user.firstName,
          propertyAddress: job.property.addressFull,
          jobId: job.id,
          deadline: job.slaDueAt || new Date(Date.now() + 48 * 60 * 60 * 1000),
          payout: Number(job.payoutAmount),
        });

        // Send push notification
        await sendPushNotification(prisma, appraiser.userId, {
          title: "New Job Available",
          body: `$${Number(job.payoutAmount)} - ${job.property.addressLine1}, ${job.property.city}`,
          icon: "/icons/icon-192x192.png",
          data: {
            url: `/appraiser/jobs/${job.id}`,
            jobId: job.id,
          },
        });
      } catch (error) {
        console.error(`Failed to send job notification to ${appraiser.userId}:`, error);
      }
    }
  }
}

export const dispatchEngine = new DispatchEngine();
