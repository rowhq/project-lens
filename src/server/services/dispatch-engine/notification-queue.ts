/**
 * Notification Queue with Retry Logic
 * Handles failed notification retries with exponential backoff
 */

import { prisma } from "@/server/db/prisma";
import { sendJobAssignment } from "@/shared/lib/resend";
import { sendPushNotification } from "@/server/api/routers/notifications.router";
import type { Job, Property } from "@prisma/client";

interface NotificationPayload {
  userId: string;
  userEmail: string;
  userName: string;
  job: Job & { property: Property };
  type: "JOB_AVAILABLE" | "JOB_REMINDER" | "JOB_ESCALATION";
}

interface QueuedNotification {
  id: string;
  payload: NotificationPayload;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: Date;
  createdAt: Date;
  lastError?: string;
}

// In-memory queue (in production, use Redis or database)
const notificationQueue: Map<string, QueuedNotification> = new Map();

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 5000, // 5 seconds
  maxDelayMs: 300000, // 5 minutes
  backoffMultiplier: 2,
};

/**
 * Generate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const delay =
    RETRY_CONFIG.baseDelayMs *
    Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Add notification to retry queue
 */
export function queueNotification(payload: NotificationPayload): void {
  const id = `${payload.userId}-${payload.job.id}-${Date.now()}`;

  notificationQueue.set(id, {
    id,
    payload,
    attempts: 0,
    maxAttempts: RETRY_CONFIG.maxAttempts,
    nextRetryAt: new Date(),
    createdAt: new Date(),
  });
}

/**
 * Send notification with retry support
 */
export async function sendNotificationWithRetry(
  payload: NotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  const { userId, userEmail, userName, job, type } = payload;

  try {
    // Send email notification
    if (userEmail) {
      await sendJobAssignment({
        email: userEmail,
        appraiserName: userName,
        propertyAddress: job.property.addressFull,
        jobId: job.id,
        deadline: job.slaDueAt || new Date(Date.now() + 48 * 60 * 60 * 1000),
        payout: Number(job.payoutAmount),
      });
    }

    // Send push notification
    await sendPushNotification(prisma, userId, {
      title:
        type === "JOB_AVAILABLE"
          ? "New Job Available"
          : type === "JOB_REMINDER"
            ? "Job Reminder"
            : "Urgent: Job Needs Attention",
      body: `$${Number(job.payoutAmount)} - ${job.property.addressLine1}, ${job.property.city}`,
      icon: "/icons/icon-192x192.png",
      data: {
        url: `/appraiser/jobs/${job.id}`,
        jobId: job.id,
      },
    });

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Notification failed for ${userId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Process the notification queue
 * Should be called periodically by a background job
 */
export async function processNotificationQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  requeued: number;
}> {
  const now = new Date();
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let requeued = 0;

  for (const [id, notification] of notificationQueue.entries()) {
    // Skip if not ready for retry
    if (notification.nextRetryAt > now) {
      continue;
    }

    processed++;
    notification.attempts++;

    const result = await sendNotificationWithRetry(notification.payload);

    if (result.success) {
      succeeded++;
      notificationQueue.delete(id);

      // Log success
      await logNotificationResult(notification, "SUCCESS");
    } else {
      // Check if we should retry
      if (notification.attempts < notification.maxAttempts) {
        // Schedule retry with exponential backoff
        const delay = getRetryDelay(notification.attempts);
        notification.nextRetryAt = new Date(Date.now() + delay);
        notification.lastError = result.error;
        requeued++;

        console.log(
          `Notification ${id} queued for retry ${notification.attempts}/${notification.maxAttempts} ` +
            `in ${delay / 1000}s`,
        );
      } else {
        // Max retries exceeded, mark as failed
        failed++;
        notificationQueue.delete(id);

        // Log failure
        await logNotificationResult(notification, "FAILED", result.error);

        console.error(
          `Notification ${id} failed permanently after ${notification.attempts} attempts`,
        );
      }
    }
  }

  return { processed, succeeded, failed, requeued };
}

/**
 * Log notification result to database
 */
async function logNotificationResult(
  notification: QueuedNotification,
  status: "SUCCESS" | "FAILED",
  error?: string,
): Promise<void> {
  try {
    // Log notification delivery result
    console.log(
      `[NotificationQueue] Delivery ${status} for user ${notification.payload.userId}, ` +
        `job ${notification.payload.job.id}, attempts: ${notification.attempts}` +
        (error ? `, error: ${error}` : ""),
    );
  } catch (err) {
    console.error("Failed to log notification result:", err);
  }
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  pending: number;
  pendingByAttempt: Record<number, number>;
  oldestInQueue: Date | null;
} {
  const pending = notificationQueue.size;
  const pendingByAttempt: Record<number, number> = {};
  let oldestInQueue: Date | null = null;

  for (const notification of notificationQueue.values()) {
    pendingByAttempt[notification.attempts] =
      (pendingByAttempt[notification.attempts] || 0) + 1;
    if (!oldestInQueue || notification.createdAt < oldestInQueue) {
      oldestInQueue = notification.createdAt;
    }
  }

  return { pending, pendingByAttempt, oldestInQueue };
}

/**
 * Clear all notifications from queue (for testing/admin)
 */
export function clearQueue(): void {
  notificationQueue.clear();
}

/**
 * Remove specific notification from queue
 */
export function removeFromQueue(id: string): boolean {
  return notificationQueue.delete(id);
}

// Start queue processor (runs every 30 seconds)
let processorInterval: NodeJS.Timeout | null = null;

export function startQueueProcessor(): void {
  if (processorInterval) return;

  processorInterval = setInterval(async () => {
    const stats = await processNotificationQueue();
    if (stats.processed > 0) {
      console.log(
        `[NotificationQueue] Processed: ${stats.processed}, ` +
          `Succeeded: ${stats.succeeded}, Failed: ${stats.failed}, Requeued: ${stats.requeued}`,
      );
    }
  }, 30000); // 30 seconds
}

export function stopQueueProcessor(): void {
  if (processorInterval) {
    clearInterval(processorInterval);
    processorInterval = null;
  }
}
