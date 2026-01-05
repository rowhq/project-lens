/**
 * Appraisal Processor
 * Orchestrates the complete appraisal workflow with automatic retries
 */

import { prisma } from "@/server/db/prisma";
import { reportGenerator } from "../report-generator";
import type { Property, AppraisalRequest } from "@prisma/client";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [
  60 * 1000, // 1 minute
  5 * 60 * 1000, // 5 minutes
  15 * 60 * 1000, // 15 minutes
];

export interface ProcessingResult {
  success: boolean;
  appraisalId: string;
  reportId?: string;
  error?: string;
  retryScheduled?: boolean;
}

/**
 * Process an appraisal request
 * This is the main entry point for generating valuations
 */
export async function processAppraisal(
  appraisalId: string,
): Promise<ProcessingResult> {
  console.log(
    `[AppraisalProcessor] ========== START Processing ${appraisalId} ==========`,
  );

  try {
    // IMMEDIATELY update status to RUNNING to prevent stuck QUEUED
    // This is done BEFORE any other operations to handle Vercel timeouts
    console.log(
      `[AppraisalProcessor] Step 0: Marking as RUNNING immediately...`,
    );
    try {
      await prisma.appraisalRequest.update({
        where: { id: appraisalId },
        data: {
          status: "RUNNING",
          lastAttemptAt: new Date(),
          statusMessage: "Starting processing...",
        },
      });
    } catch (updateError) {
      // If we can't update, the appraisal might not exist
      console.error(
        `[AppraisalProcessor] Failed to mark as RUNNING:`,
        updateError,
      );
      return {
        success: false,
        appraisalId,
        error: "Failed to update appraisal status",
      };
    }

    // Get appraisal with property
    console.log(`[AppraisalProcessor] Step 1: Fetching appraisal from DB...`);
    const appraisal = await prisma.appraisalRequest.findUnique({
      where: { id: appraisalId },
      include: { property: true },
    });

    if (!appraisal) {
      console.error(`[AppraisalProcessor] FAILED: Appraisal not found in DB`);
      // Already marked as RUNNING, now mark as FAILED
      await prisma.appraisalRequest
        .update({
          where: { id: appraisalId },
          data: {
            status: "FAILED",
            statusMessage: "Appraisal record not found",
          },
        })
        .catch(() => {}); // Ignore if fails
      return {
        success: false,
        appraisalId,
        error: "Appraisal not found",
      };
    }

    console.log(
      `[AppraisalProcessor] Step 1: Found appraisal ${appraisal.referenceCode}`,
    );

    if (!appraisal.property) {
      console.error(
        `[AppraisalProcessor] FAILED: Property not found for appraisal`,
      );
      // Mark as FAILED since property is missing
      await prisma.appraisalRequest.update({
        where: { id: appraisalId },
        data: {
          status: "FAILED",
          statusMessage: "Property not found for appraisal",
        },
      });
      return {
        success: false,
        appraisalId,
        error: "Property not found for appraisal",
      };
    }

    console.log(
      `[AppraisalProcessor] Step 1: Property: ${appraisal.property.addressFull}`,
    );

    // Update status message with retry info
    console.log(`[AppraisalProcessor] Step 2: Updating status message...`);
    await prisma.appraisalRequest.update({
      where: { id: appraisalId },
      data: {
        statusMessage:
          appraisal.retryCount > 0
            ? `Processing (attempt ${appraisal.retryCount + 1}/${MAX_RETRIES + 1})`
            : "Processing valuation...",
      },
    });
    console.log(`[AppraisalProcessor] Step 2: Status message updated`);

    // Generate complete report (includes valuation, HTML, PDF, and email notification)
    console.log(`[AppraisalProcessor] Step 3: Starting report generation...`);
    const result = await reportGenerator.generate({
      appraisalRequestId: appraisalId,
      reportType: appraisal.requestedType as
        | "AI_REPORT"
        | "AI_REPORT_WITH_ONSITE"
        | "CERTIFIED_APPRAISAL",
      generatedById: appraisal.requestedById,
    });

    console.log(
      `[AppraisalProcessor] Step 3: Report created: ${result.reportId}`,
    );
    console.log(
      `[AppraisalProcessor] Step 3: PDF URL: ${result.pdfUrl || "none"}`,
    );
    console.log(
      `[AppraisalProcessor] Step 3: Valuation: $${result.summary.valueEstimate.toLocaleString()}`,
    );

    return {
      success: true,
      appraisalId,
      reportId: result.reportId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error(`[AppraisalProcessor] ========== EXCEPTION ==========`);
    console.error(`[AppraisalProcessor] Error: ${errorMessage}`);
    console.error(`[AppraisalProcessor] Stack: ${errorStack}`);

    // Get current appraisal to check retry count
    const currentAppraisal = await prisma.appraisalRequest.findUnique({
      where: { id: appraisalId },
      select: { retryCount: true },
    });

    const retryCount = currentAppraisal?.retryCount ?? 0;

    // Check if we should retry
    if (retryCount < MAX_RETRIES) {
      const nextRetryDelay =
        RETRY_DELAYS_MS[retryCount] ||
        RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      const nextRetryAt = new Date(Date.now() + nextRetryDelay);

      await prisma.appraisalRequest.update({
        where: { id: appraisalId },
        data: {
          status: "QUEUED",
          retryCount: retryCount + 1,
          nextRetryAt,
          statusMessage: `Retry ${retryCount + 1}/${MAX_RETRIES} scheduled for ${nextRetryAt.toLocaleTimeString()}`,
        },
      });

      console.log(
        `[AppraisalProcessor] Scheduled retry ${retryCount + 1}/${MAX_RETRIES} for ${appraisalId} at ${nextRetryAt.toISOString()}`,
      );

      return {
        success: false,
        appraisalId,
        error: errorMessage,
        retryScheduled: true,
      };
    }

    // Max retries exceeded - mark as permanently failed
    await prisma.appraisalRequest.update({
      where: { id: appraisalId },
      data: {
        status: "FAILED",
        statusMessage: `Processing failed after ${MAX_RETRIES} retries: ${errorMessage}`,
      },
    });

    console.error(
      `[AppraisalProcessor] Permanently failed ${appraisalId} after ${MAX_RETRIES} retries`,
    );

    return {
      success: false,
      appraisalId,
      error: errorMessage,
      retryScheduled: false,
    };
  }
}

/**
 * Process all queued appraisals (including due retries and stuck RUNNING)
 * Useful for batch processing or cron jobs
 */
export async function processQueuedAppraisals(): Promise<ProcessingResult[]> {
  const now = new Date();
  // Appraisals stuck in RUNNING for more than 10 minutes should be re-processed
  // (Vercel serverless has max 60s timeout on Pro, so 10min is plenty)
  const runningStuckThreshold = new Date(Date.now() - 10 * 60 * 1000);
  // Appraisals stuck in QUEUED (no nextRetryAt) for more than 2 minutes
  // (Should have been processed immediately, so something went wrong)
  const queuedStuckThreshold = new Date(Date.now() - 2 * 60 * 1000);

  // Find appraisals that are either:
  // 1. QUEUED with no retry scheduled AND older than 2 min (stuck new appraisals)
  // 2. QUEUED with nextRetryAt <= now (retries that are due)
  // 3. RUNNING with lastAttemptAt > 10 min ago (stuck appraisals - likely timeout)
  const queued = await prisma.appraisalRequest.findMany({
    where: {
      OR: [
        // New appraisals in QUEUED that are stuck (should have processed immediately)
        {
          status: "QUEUED",
          nextRetryAt: null,
          createdAt: { lt: queuedStuckThreshold },
        },
        // Retries that are due
        { status: "QUEUED", nextRetryAt: { lte: now } },
        // Stuck in RUNNING for more than 10 minutes (likely Vercel timeout)
        { status: "RUNNING", lastAttemptAt: { lt: runningStuckThreshold } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 10, // Process 10 at a time
  });

  console.log(
    `[AppraisalProcessor] Processing ${queued.length} queued appraisals (including retries)`,
  );

  const results: ProcessingResult[] = [];

  for (const appraisal of queued) {
    const result = await processAppraisal(appraisal.id);
    results.push(result);
  }

  return results;
}

/**
 * Retry a failed appraisal (manual retry - resets retry count)
 */
export async function retryAppraisal(
  appraisalId: string,
): Promise<ProcessingResult> {
  // Reset status to QUEUED and clear retry tracking for fresh start
  await prisma.appraisalRequest.update({
    where: { id: appraisalId },
    data: {
      status: "QUEUED",
      retryCount: 0,
      nextRetryAt: null,
      statusMessage: "Manual retry requested",
    },
  });

  return processAppraisal(appraisalId);
}
