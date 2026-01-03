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
  console.log(`[AppraisalProcessor] Starting processing for ${appraisalId}`);

  try {
    // Get appraisal with property
    const appraisal = await prisma.appraisalRequest.findUnique({
      where: { id: appraisalId },
      include: { property: true },
    });

    if (!appraisal) {
      return {
        success: false,
        appraisalId,
        error: "Appraisal not found",
      };
    }

    if (!appraisal.property) {
      return {
        success: false,
        appraisalId,
        error: "Property not found for appraisal",
      };
    }

    // Update status to RUNNING and record attempt
    await prisma.appraisalRequest.update({
      where: { id: appraisalId },
      data: {
        status: "RUNNING",
        lastAttemptAt: new Date(),
        statusMessage:
          appraisal.retryCount > 0
            ? `Processing (attempt ${appraisal.retryCount + 1}/${MAX_RETRIES + 1})`
            : "Processing...",
      },
    });

    console.log(
      `[AppraisalProcessor] Generating report for ${appraisal.property.addressFull}`,
    );

    // Generate complete report (includes valuation, HTML, PDF, and email notification)
    const result = await reportGenerator.generate({
      appraisalRequestId: appraisalId,
      reportType: appraisal.requestedType as
        | "AI_REPORT"
        | "AI_REPORT_WITH_ONSITE"
        | "CERTIFIED_APPRAISAL",
      generatedById: appraisal.requestedById,
    });

    console.log(
      `[AppraisalProcessor] Report created: ${result.reportId} (PDF: ${result.pdfUrl ? "yes" : "no"})`,
    );
    console.log(
      `[AppraisalProcessor] Valuation: $${result.summary.valueEstimate.toLocaleString()}`,
    );

    return {
      success: true,
      appraisalId,
      reportId: result.reportId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[AppraisalProcessor] Error processing ${appraisalId}:`,
      error,
    );

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
 * Process all queued appraisals (including due retries)
 * Useful for batch processing or cron jobs
 */
export async function processQueuedAppraisals(): Promise<ProcessingResult[]> {
  const now = new Date();

  // Find appraisals that are either:
  // 1. QUEUED with no retry scheduled (new appraisals)
  // 2. QUEUED with nextRetryAt <= now (retries that are due)
  const queued = await prisma.appraisalRequest.findMany({
    where: {
      status: "QUEUED",
      OR: [
        { nextRetryAt: null }, // New appraisals
        { nextRetryAt: { lte: now } }, // Retries that are due
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
