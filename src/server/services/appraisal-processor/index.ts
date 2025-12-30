/**
 * Appraisal Processor
 * Orchestrates the complete appraisal workflow
 */

import { prisma } from "@/server/db/prisma";
import { valuationEngine } from "../valuation-engine";
import type { Property, AppraisalRequest } from "@prisma/client";

export interface ProcessingResult {
  success: boolean;
  appraisalId: string;
  reportId?: string;
  error?: string;
}

/**
 * Process an appraisal request
 * This is the main entry point for generating valuations
 */
export async function processAppraisal(
  appraisalId: string
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

    // Update status to RUNNING
    await prisma.appraisalRequest.update({
      where: { id: appraisalId },
      data: { status: "RUNNING" },
    });

    console.log(`[AppraisalProcessor] Generating valuation for ${appraisal.property.addressFull}`);

    // Generate valuation
    const valuation = await valuationEngine.generateValuation({
      property: appraisal.property,
      purpose: appraisal.purpose,
      requestedType: appraisal.requestedType as
        | "AI_REPORT"
        | "AI_REPORT_WITH_ONSITE"
        | "CERTIFIED_APPRAISAL",
    });

    console.log(`[AppraisalProcessor] Valuation complete: $${valuation.valueEstimate.toLocaleString()}`);

    // Create report
    const report = await valuationEngine.createReport(
      appraisalId,
      valuation,
      appraisal.requestedType as
        | "AI_REPORT"
        | "AI_REPORT_WITH_ONSITE"
        | "CERTIFIED_APPRAISAL"
    );

    console.log(`[AppraisalProcessor] Report created: ${report.id}`);

    return {
      success: true,
      appraisalId,
      reportId: report.id,
    };
  } catch (error) {
    console.error(`[AppraisalProcessor] Error processing ${appraisalId}:`, error);

    // Update status to FAILED
    await prisma.appraisalRequest.update({
      where: { id: appraisalId },
      data: {
        status: "FAILED",
        notes: `Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
    });

    return {
      success: false,
      appraisalId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process all queued appraisals
 * Useful for batch processing or cron jobs
 */
export async function processQueuedAppraisals(): Promise<ProcessingResult[]> {
  const queued = await prisma.appraisalRequest.findMany({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    take: 10, // Process 10 at a time
  });

  console.log(`[AppraisalProcessor] Processing ${queued.length} queued appraisals`);

  const results: ProcessingResult[] = [];

  for (const appraisal of queued) {
    const result = await processAppraisal(appraisal.id);
    results.push(result);
  }

  return results;
}

/**
 * Retry a failed appraisal
 */
export async function retryAppraisal(
  appraisalId: string
): Promise<ProcessingResult> {
  // Reset status to QUEUED
  await prisma.appraisalRequest.update({
    where: { id: appraisalId },
    data: { status: "QUEUED" },
  });

  return processAppraisal(appraisalId);
}
