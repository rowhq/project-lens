/**
 * SLA Monitor
 * Monitors job SLAs and handles escalations
 */

import { prisma } from "@/server/db/prisma";
import type { Job, JobStatus } from "@prisma/client";

/**
 * SLA configuration by job type
 */
const SLA_CONFIG = {
  // Time limits in hours
  dispatch: {
    NORMAL: 1,
    URGENT: 0.5,
    CRITICAL: 0.25,
  },
  acceptance: {
    NORMAL: 4,
    URGENT: 2,
    CRITICAL: 1,
  },
  completion: {
    AI_REPORT: 0.5, // 30 minutes
    ON_SITE: 48, // 48 hours
    CERTIFIED: 72, // 72 hours
  },
  evidenceSubmission: {
    NORMAL: 24,
    URGENT: 12,
    CRITICAL: 6,
  },
};

/**
 * Escalation levels
 */
type EscalationLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "CRITICAL";

interface SLABreachResult {
  jobId: string;
  breachType: string;
  level: EscalationLevel;
  hoursOverdue: number;
}

/**
 * SLA Monitor class
 */
class SLAMonitor {
  /**
   * Check all active jobs for SLA breaches
   */
  async checkAndEscalate(): Promise<{
    breached: number;
    escalated: number;
  }> {
    const breaches: SLABreachResult[] = [];

    // Check dispatch SLA
    const dispatchBreaches = await this.checkDispatchSLA();
    breaches.push(...dispatchBreaches);

    // Check acceptance SLA
    const acceptanceBreaches = await this.checkAcceptanceSLA();
    breaches.push(...acceptanceBreaches);

    // Check completion SLA
    const completionBreaches = await this.checkCompletionSLA();
    breaches.push(...completionBreaches);

    // Check evidence submission SLA
    const evidenceBreaches = await this.checkEvidenceSubmissionSLA();
    breaches.push(...evidenceBreaches);

    // Handle escalations
    let escalated = 0;
    for (const breach of breaches) {
      const wasEscalated = await this.handleEscalation(breach);
      if (wasEscalated) escalated++;
    }

    return {
      breached: breaches.length,
      escalated,
    };
  }

  /**
   * Check dispatch SLA (time from creation to dispatch)
   */
  private async checkDispatchSLA(): Promise<SLABreachResult[]> {
    const breaches: SLABreachResult[] = [];
    const now = new Date();

    const pendingJobs = await prisma.job.findMany({
      where: {
        status: "PENDING_DISPATCH",
      },
    });

    for (const job of pendingJobs) {
      const urgency = this.getJobUrgency(job);
      const slaHours = SLA_CONFIG.dispatch[urgency];
      const hoursSinceCreation =
        (now.getTime() - job.createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation > slaHours) {
        breaches.push({
          jobId: job.id,
          breachType: "DISPATCH_DELAYED",
          level: this.determineEscalationLevel(hoursSinceCreation, slaHours),
          hoursOverdue: hoursSinceCreation - slaHours,
        });
      }
    }

    return breaches;
  }

  /**
   * Check acceptance SLA (time from dispatch to acceptance)
   */
  private async checkAcceptanceSLA(): Promise<SLABreachResult[]> {
    const breaches: SLABreachResult[] = [];
    const now = new Date();

    const dispatchedJobs = await prisma.job.findMany({
      where: {
        status: "DISPATCHED",
        dispatchedAt: { not: null },
      },
    });

    for (const job of dispatchedJobs) {
      if (!job.dispatchedAt) continue;

      const urgency = this.getJobUrgency(job);
      const slaHours = SLA_CONFIG.acceptance[urgency];
      const hoursSinceDispatch =
        (now.getTime() - job.dispatchedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceDispatch > slaHours) {
        breaches.push({
          jobId: job.id,
          breachType: "ACCEPTANCE_DELAYED",
          level: this.determineEscalationLevel(hoursSinceDispatch, slaHours),
          hoursOverdue: hoursSinceDispatch - slaHours,
        });
      }
    }

    return breaches;
  }

  /**
   * Check completion SLA (time from acceptance to completion)
   */
  private async checkCompletionSLA(): Promise<SLABreachResult[]> {
    const breaches: SLABreachResult[] = [];
    const now = new Date();

    const activeJobs = await prisma.job.findMany({
      where: {
        status: { in: ["ACCEPTED", "IN_PROGRESS", "SUBMITTED"] },
        acceptedAt: { not: null },
      },
    });

    for (const job of activeJobs) {
      if (!job.acceptedAt) continue;

      // Use SLA due date if set, otherwise calculate from job type
      const slaHours = job.slaDueAt
        ? (job.slaDueAt.getTime() - job.acceptedAt.getTime()) / (1000 * 60 * 60)
        : SLA_CONFIG.completion[
            job.jobType as keyof typeof SLA_CONFIG.completion
          ] || 48;

      const hoursSinceAcceptance =
        (now.getTime() - job.acceptedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceAcceptance > slaHours) {
        breaches.push({
          jobId: job.id,
          breachType: "COMPLETION_DELAYED",
          level: this.determineEscalationLevel(hoursSinceAcceptance, slaHours),
          hoursOverdue: hoursSinceAcceptance - slaHours,
        });
      }
    }

    return breaches;
  }

  /**
   * Check evidence submission SLA
   */
  private async checkEvidenceSubmissionSLA(): Promise<SLABreachResult[]> {
    const breaches: SLABreachResult[] = [];
    const now = new Date();

    const inProgressJobs = await prisma.job.findMany({
      where: {
        status: "IN_PROGRESS",
        startedAt: { not: null },
      },
    });

    for (const job of inProgressJobs) {
      if (!job.startedAt) continue;

      const urgency = this.getJobUrgency(job);
      const slaHours = SLA_CONFIG.evidenceSubmission[urgency];
      const hoursSinceStart =
        (now.getTime() - job.startedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceStart > slaHours) {
        breaches.push({
          jobId: job.id,
          breachType: "EVIDENCE_DELAYED",
          level: this.determineEscalationLevel(hoursSinceStart, slaHours),
          hoursOverdue: hoursSinceStart - slaHours,
        });
      }
    }

    return breaches;
  }

  /**
   * Get urgency level for a job
   */
  private getJobUrgency(job: Job): "NORMAL" | "URGENT" | "CRITICAL" {
    // Determine urgency based on SLA deadline proximity
    if (!job.slaDueAt) return "NORMAL";

    const now = new Date();
    const hoursUntilDue =
      (job.slaDueAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue <= 4) return "CRITICAL";
    if (hoursUntilDue <= 12) return "URGENT";
    return "NORMAL";
  }

  /**
   * Determine escalation level based on overdue time
   */
  private determineEscalationLevel(
    actualHours: number,
    slaHours: number,
  ): EscalationLevel {
    const overdueRatio = actualHours / slaHours;

    if (overdueRatio >= 4) return "CRITICAL";
    if (overdueRatio >= 2.5) return "LEVEL_3";
    if (overdueRatio >= 1.5) return "LEVEL_2";
    return "LEVEL_1";
  }

  /**
   * Handle escalation for a breach
   */
  private async handleEscalation(breach: SLABreachResult): Promise<boolean> {
    const job = await prisma.job.findUnique({
      where: { id: breach.jobId },
      include: { appraisalRequest: true },
    });

    if (!job) return false;

    // Check if already escalated to this level from statusHistory
    const rawHistory = job.statusHistory;
    const statusHistory = (
      Array.isArray(rawHistory) ? rawHistory : []
    ) as Array<{ level?: string }>;
    const lastEscalation = statusHistory.filter((s) => s.level).pop();
    if (lastEscalation?.level === breach.level) return false;

    // Get current statusHistory as array
    const currentHistory = Array.isArray(job.statusHistory)
      ? job.statusHistory
      : [];

    // Update job with escalation info in statusHistory
    // Note: slaBreached and escalationLevel fields will be added after migration
    await prisma.job.update({
      where: { id: breach.jobId },
      data: {
        statusHistory: [
          ...currentHistory,
          {
            status: "SLA_BREACH",
            timestamp: new Date().toISOString(),
            breachType: breach.breachType,
            level: breach.level,
            hoursOverdue: breach.hoursOverdue,
            slaBreached: true, // Store in statusHistory until schema is migrated
          },
        ],
      },
    });

    // Create notifications based on escalation level
    await this.createEscalationNotifications(breach, job);

    // Log to audit
    await prisma.auditLog.create({
      data: {
        resource: "JOB",
        resourceId: breach.jobId,
        action: "SLA_BREACH",
        metadata: {
          breachType: breach.breachType,
          level: breach.level,
          hoursOverdue: breach.hoursOverdue,
        },
      },
    });

    return true;
  }

  /**
   * Create notifications for escalation
   */
  private async createEscalationNotifications(
    breach: SLABreachResult,
    job: Job & {
      appraisalRequest: {
        organizationId: string;
        requestedById: string;
      } | null;
    },
  ): Promise<void> {
    const notifications: {
      userId: string;
      type: string;
      title: string;
      body: string;
      channel: string;
    }[] = [];

    // Notify assigned appraiser if exists
    if (job.assignedAppraiserId && breach.level !== "LEVEL_1") {
      notifications.push({
        userId: job.assignedAppraiserId,
        type: "SLA_WARNING",
        title: "Job SLA Warning",
        body: `Your assigned job is ${breach.hoursOverdue.toFixed(1)} hours overdue. Please complete soon.`,
        channel: "push",
      });
    }

    // Notify requesting client for higher levels
    if (
      breach.level === "LEVEL_2" ||
      breach.level === "LEVEL_3" ||
      breach.level === "CRITICAL"
    ) {
      if (job.appraisalRequest) {
        notifications.push({
          userId: job.appraisalRequest.requestedById,
          type: "SLA_BREACH",
          title: "Appraisal Delay Notice",
          body: `Your appraisal request is experiencing delays. We're working to resolve this.`,
          channel: "email",
        });
      }
    }

    // Notify admins for critical breaches
    if (breach.level === "CRITICAL") {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true },
      });

      for (const admin of admins) {
        notifications.push({
          userId: admin.id,
          type: "CRITICAL_SLA_BREACH",
          title: "Critical SLA Breach",
          body: `Job ${job.id} has critical SLA breach: ${breach.breachType}. Immediate attention required.`,
          channel: "push",
        });
      }
    }

    // Create all notifications
    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }
  }

  /**
   * Get SLA status for a specific job
   */
  async getJobSLAStatus(jobId: string): Promise<{
    status: "ON_TRACK" | "AT_RISK" | "BREACHED";
    dueIn: number | null; // hours until SLA breach
    breachType?: string;
  }> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return { status: "ON_TRACK", dueIn: null };
    }

    const now = new Date();

    // Check based on current status
    let slaDeadline: Date | null = null;
    let breachType: string = "";

    switch (job.status) {
      case "PENDING_DISPATCH": {
        const urgency = this.getJobUrgency(job);
        const slaHours = SLA_CONFIG.dispatch[urgency];
        slaDeadline = new Date(
          job.createdAt.getTime() + slaHours * 60 * 60 * 1000,
        );
        breachType = "DISPATCH_DELAYED";
        break;
      }
      case "DISPATCHED": {
        if (job.dispatchedAt) {
          const urgency = this.getJobUrgency(job);
          const slaHours = SLA_CONFIG.acceptance[urgency];
          slaDeadline = new Date(
            job.dispatchedAt.getTime() + slaHours * 60 * 60 * 1000,
          );
          breachType = "ACCEPTANCE_DELAYED";
        }
        break;
      }
      case "ACCEPTED":
      case "IN_PROGRESS":
      case "SUBMITTED": {
        if (job.slaDueAt) {
          slaDeadline = job.slaDueAt;
          breachType = "COMPLETION_DELAYED";
        }
        break;
      }
      default:
        return { status: "ON_TRACK", dueIn: null };
    }

    if (!slaDeadline) {
      return { status: "ON_TRACK", dueIn: null };
    }

    const hoursRemaining =
      (slaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return { status: "BREACHED", dueIn: hoursRemaining, breachType };
    }

    if (hoursRemaining < 2) {
      return { status: "AT_RISK", dueIn: hoursRemaining };
    }

    return { status: "ON_TRACK", dueIn: hoursRemaining };
  }

  /**
   * Get overall SLA metrics
   */
  async getSLAMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalJobs: number;
    onTimeCompletion: number;
    avgCompletionTime: number;
    breachRate: number;
  }> {
    const jobs = await prisma.job.findMany({
      where: {
        createdAt: { gte: startDate },
        completedAt: { lte: endDate },
        status: "COMPLETED",
      },
    });

    let onTimeCount = 0;
    let totalCompletionTime = 0;

    for (const job of jobs) {
      if (job.completedAt && job.acceptedAt) {
        const completionHours =
          (job.completedAt.getTime() - job.acceptedAt.getTime()) /
          (1000 * 60 * 60);
        totalCompletionTime += completionHours;

        // Check if completed before SLA
        if (job.slaDueAt && job.completedAt <= job.slaDueAt) {
          onTimeCount++;
        }
      }
    }

    const totalJobs = jobs.length;

    return {
      totalJobs,
      onTimeCompletion: totalJobs > 0 ? (onTimeCount / totalJobs) * 100 : 100,
      avgCompletionTime: totalJobs > 0 ? totalCompletionTime / totalJobs : 0,
      breachRate:
        totalJobs > 0 ? ((totalJobs - onTimeCount) / totalJobs) * 100 : 0,
    };
  }
}

export const slaMonitor = new SLAMonitor();
