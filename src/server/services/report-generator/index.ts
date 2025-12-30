/**
 * Report Generator Service
 * Generates AI, On-site, and Certified appraisal reports
 */

import { prisma } from "@/server/db/prisma";
import { valuationEngine } from "@/server/services/valuation-engine";
import { templateEngine } from "./template-engine";
import { pdfGenerator } from "./pdf-generator";
import { sendAppraisalReady } from "@/shared/lib/resend";
import type { Report, Property, AppraisalRequest, Evidence } from "@prisma/client";

export interface ReportGenerationInput {
  appraisalRequestId: string;
  reportType: "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL";
  generatedById: string;
  evidenceIds?: string[];
  appraiserNotes?: string;
  certificationNumber?: string;
}

export interface GeneratedReport {
  reportId: string;
  htmlContent: string;
  pdfUrl?: string;
  summary: ReportSummary;
}

export interface ReportSummary {
  valueEstimate: number;
  valueRange: { min: number; max: number };
  confidenceScore: number;
  reportType: string;
  generatedAt: Date;
}

/**
 * Report generator class
 */
class ReportGenerator {
  /**
   * Generate a complete appraisal report
   */
  async generate(input: ReportGenerationInput): Promise<GeneratedReport> {
    // Get appraisal request with property
    const appraisalRequest = await prisma.appraisalRequest.findUnique({
      where: { id: input.appraisalRequestId },
      include: {
        property: true,
        organization: true,
        requestedBy: true,
      },
    });

    if (!appraisalRequest) {
      throw new Error("Appraisal request not found");
    }

    // Get evidence if on-site or certified
    let evidence: Evidence[] = [];
    if (input.evidenceIds && input.evidenceIds.length > 0) {
      evidence = await prisma.evidence.findMany({
        where: { id: { in: input.evidenceIds } },
      });
    }

    // Generate valuation
    const valuation = await valuationEngine.generateValuation({
      property: appraisalRequest.property,
      purpose: appraisalRequest.purpose,
      requestedType: appraisalRequest.requestedType as "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL",
    });

    // Create report data
    const reportData: ReportData = {
      reportType: input.reportType,
      appraisalRequest,
      property: appraisalRequest.property,
      valuation,
      evidence,
      appraiserNotes: input.appraiserNotes,
      generatedAt: new Date(),
      generatedById: input.generatedById,
      certificationNumber: input.certificationNumber,
    };

    // Generate HTML report
    const htmlContent = await templateEngine.render(reportData);

    // Generate PDF
    const pdfUrl = await pdfGenerator.generate(htmlContent, {
      reportId: appraisalRequest.referenceCode,
      reportType: input.reportType,
    });

    // Calculate risk score from risk flags
    const riskScore = valuation.riskFlags.reduce((score, flag) => {
      if (flag.severity === "HIGH") return score + 30;
      if (flag.severity === "MEDIUM") return score + 15;
      return score + 5;
    }, 0);

    // Create report record
    const report = await prisma.report.create({
      data: {
        type: input.reportType,
        valueEstimate: valuation.valueEstimate,
        valueRangeMin: valuation.valueRangeMin,
        valueRangeMax: valuation.valueRangeMax,
        fastSaleEstimate: valuation.fastSaleEstimate,
        confidenceScore: valuation.confidenceScore,
        htmlContent,
        pdfUrl,
        comps: JSON.parse(JSON.stringify(valuation.comps)),
        compsCount: valuation.comps.length,
        riskFlags: JSON.parse(JSON.stringify(valuation.riskFlags)),
        riskScore: Math.min(100, riskScore),
        aiAnalysis: JSON.parse(JSON.stringify(valuation.aiAnalysis)),
        marketTrends: JSON.parse(JSON.stringify(valuation.marketTrends)),
        certificationNumber: input.certificationNumber,
      },
    });

    // Update appraisal request
    await prisma.appraisalRequest.update({
      where: { id: input.appraisalRequestId },
      data: {
        reportId: report.id,
        status: "READY",
        completedAt: new Date(),
      },
    });

    // Send notification email
    try {
      const reportTypeLabels = {
        AI_REPORT: "AI Valuation Report",
        AI_REPORT_WITH_ONSITE: "On-Site Verification Report",
        CERTIFIED_APPRAISAL: "Certified Appraisal Report",
      };
      await sendAppraisalReady({
        email: appraisalRequest.requestedBy.email || "",
        userName: appraisalRequest.requestedBy.firstName,
        propertyAddress: appraisalRequest.property.addressFull,
        appraisalId: appraisalRequest.id,
        reportType: reportTypeLabels[input.reportType],
      });
    } catch (error) {
      console.error("Failed to send appraisal ready email:", error);
    }

    // Log generation
    await prisma.auditLog.create({
      data: {
        userId: input.generatedById,
        resource: "REPORT",
        resourceId: report.id,
        action: "GENERATE",
        metadata: {
          reportType: input.reportType,
          valueEstimate: valuation.valueEstimate,
          confidenceScore: valuation.confidenceScore,
        },
      },
    });

    return {
      reportId: report.id,
      htmlContent,
      pdfUrl,
      summary: {
        valueEstimate: valuation.valueEstimate,
        valueRange: {
          min: valuation.valueRangeMin,
          max: valuation.valueRangeMax,
        },
        confidenceScore: valuation.confidenceScore,
        reportType: input.reportType,
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Regenerate an existing report
   */
  async regenerate(
    reportId: string,
    userId: string
  ): Promise<GeneratedReport> {
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      include: { appraisalRequest: true },
    });

    if (!existingReport) {
      throw new Error("Report not found");
    }

    if (!existingReport.appraisalRequest) {
      throw new Error("Report has no associated appraisal request");
    }

    // Increment version and lock the old report
    await prisma.report.update({
      where: { id: reportId },
      data: {
        version: { increment: 1 },
        lockedAt: new Date(),
      },
    });

    // Generate new report
    return this.generate({
      appraisalRequestId: existingReport.appraisalRequest.id,
      reportType: existingReport.type as "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL",
      generatedById: userId,
    });
  }

  /**
   * Sign and lock a certified report
   */
  async signReport(
    reportId: string,
    appraiserId: string,
    signature: {
      licenseNumber: string;
      signedAt: Date;
    }
  ): Promise<Report> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { appraisalRequest: true },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.type !== "CERTIFIED_APPRAISAL") {
      throw new Error("Only certified reports can be signed");
    }

    if (report.lockedAt) {
      throw new Error("Report is already locked");
    }

    // Verify appraiser license
    const appraiser = await prisma.appraiserProfile.findUnique({
      where: { userId: appraiserId },
    });

    if (!appraiser || appraiser.licenseNumber !== signature.licenseNumber) {
      throw new Error("Invalid license number");
    }

    // Update report with signature
    const signedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        signedById: appraiserId,
        signedAt: signature.signedAt,
        certificationNumber: `CERT-${Date.now()}-${reportId.slice(0, 8)}`,
        lockedAt: new Date(),
      },
    });

    // Update appraisal request if exists
    if (report.appraisalRequest) {
      await prisma.appraisalRequest.update({
        where: { id: report.appraisalRequest.id },
        data: { status: "READY" },
      });
    }

    // Log signing
    await prisma.auditLog.create({
      data: {
        userId: appraiserId,
        resource: "REPORT",
        resourceId: reportId,
        action: "SIGN",
        metadata: {
          licenseNumber: signature.licenseNumber,
          signedAt: signature.signedAt.toISOString(),
        },
      },
    });

    return signedReport;
  }

  /**
   * Get report download URL
   */
  async getDownloadUrl(reportId: string): Promise<string> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.pdfUrl) {
      return report.pdfUrl;
    }

    // Generate PDF on demand
    if (report.htmlContent) {
      const pdfUrl = await pdfGenerator.generate(report.htmlContent, {
        reportId,
        reportType: report.type,
      });

      await prisma.report.update({
        where: { id: reportId },
        data: { pdfUrl },
      });

      return pdfUrl;
    }

    throw new Error("No content available for PDF generation");
  }

  /**
   * Create shareable link for report
   * TODO: Implement sharing with a separate ShareLink model
   */
  async createShareableLink(
    reportId: string,
    expiresIn: number = 24 // hours
  ): Promise<{ shareableUrl: string; expiresAt: Date }> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    // Generate share token (would be stored in a separate table)
    const shareToken = this.generateShareToken();
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://projectlens.com";
    const shareableUrl = `${baseUrl}/reports/shared/${shareToken}`;

    return { shareableUrl, expiresAt };
  }

  /**
   * Generate random share token
   */
  private generateShareToken(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

// Types
interface ReportData {
  reportType: "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL";
  appraisalRequest: AppraisalRequest & {
    property: Property;
    organization: { name: string };
    requestedBy: { firstName: string; lastName: string };
  };
  property: Property;
  valuation: Awaited<ReturnType<typeof valuationEngine.generateValuation>>;
  evidence: Evidence[];
  appraiserNotes?: string;
  generatedAt: Date;
  generatedById: string;
  certificationNumber?: string;
}

export const reportGenerator = new ReportGenerator();
