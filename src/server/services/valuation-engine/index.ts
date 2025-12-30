/**
 * Valuation Engine
 * AI-powered property valuation with comparables analysis
 */

import { prisma } from "@/server/db/prisma";
import { aiAnalyzer } from "./ai-analyzer";
import { compFinder } from "./comp-finder";
import { riskAssessor } from "./risk-assessor";
import { valueCalculator } from "./value-calculator";
import type { Property, Report } from "@prisma/client";

export interface ValuationInput {
  property: Property;
  purpose: string;
  requestedType: "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL";
}

export interface ValuationResult {
  valueEstimate: number;
  valueRangeMin: number;
  valueRangeMax: number;
  fastSaleEstimate: number;
  confidenceScore: number;
  pricePerSqft: number;
  methodology: string;
  comps: ComparableProperty[];
  riskFlags: RiskFlag[];
  aiAnalysis: AIAnalysis;
  marketTrends: MarketTrends;
}

export interface ComparableProperty {
  id: string;
  address: string;
  salePrice: number;
  saleDate: string;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  distance: number;
  similarityScore: number;
  adjustedPrice: number;
  adjustments: Adjustment[];
}

export interface Adjustment {
  factor: string;
  amount: number;
  reason: string;
}

export interface RiskFlag {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  recommendation: string;
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  concerns: string[];
  marketPosition: string;
  investmentPotential: string;
}

export interface MarketTrends {
  medianPrice: number;
  priceChange30d: number;
  priceChange90d: number;
  daysOnMarket: number;
  inventory: number;
  demandLevel: "LOW" | "MODERATE" | "HIGH";
}

/**
 * Main valuation engine class
 */
export class ValuationEngine {
  /**
   * Generate a complete property valuation
   */
  async generateValuation(input: ValuationInput): Promise<ValuationResult> {
    const { property } = input;

    // Step 1: Find comparable properties
    const comps = await compFinder.findComparables(property);

    // Step 2: Calculate value based on comps
    const valueResult = valueCalculator.calculate(property, comps);

    // Step 3: Assess risks
    const riskFlags = await riskAssessor.assess(property, comps, valueResult);

    // Step 4: Get AI analysis
    const aiAnalysis = await aiAnalyzer.analyze(property, comps, valueResult);

    // Step 5: Get market trends
    const marketTrends = await this.getMarketTrends(property);

    // Step 6: Calculate confidence score
    const confidenceScore = this.calculateConfidence(comps, riskFlags);

    // Calculate price per sqft
    const pricePerSqft = property.sqft && property.sqft > 0
      ? valueResult.estimate / property.sqft
      : 0;

    return {
      valueEstimate: valueResult.estimate,
      valueRangeMin: valueResult.rangeMin,
      valueRangeMax: valueResult.rangeMax,
      fastSaleEstimate: valueResult.fastSale,
      confidenceScore,
      pricePerSqft,
      methodology: "Sales Comparison Approach with AI-Enhanced Adjustments",
      comps,
      riskFlags,
      aiAnalysis,
      marketTrends,
    };
  }

  /**
   * Calculate confidence score based on data quality
   */
  private calculateConfidence(
    comps: ComparableProperty[],
    riskFlags: RiskFlag[]
  ): number {
    let score = 100;

    // Deduct for insufficient comps
    if (comps.length < 3) score -= 20;
    else if (comps.length < 5) score -= 10;

    // Deduct for old comps
    const recentComps = comps.filter((c) => {
      const saleDate = new Date(c.saleDate);
      const monthsAgo =
        (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 6;
    });
    if (recentComps.length < 2) score -= 15;

    // Deduct for low similarity scores
    const avgSimilarity =
      comps.reduce((sum, c) => sum + c.similarityScore, 0) / comps.length;
    if (avgSimilarity < 70) score -= 15;
    else if (avgSimilarity < 80) score -= 8;

    // Deduct for high-severity risk flags
    const highRisks = riskFlags.filter((f) => f.severity === "HIGH").length;
    const mediumRisks = riskFlags.filter((f) => f.severity === "MEDIUM").length;
    score -= highRisks * 10;
    score -= mediumRisks * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get market trends for property area
   */
  private async getMarketTrends(property: Property): Promise<MarketTrends> {
    // TODO: Fetch real market data from ATTOM or similar API
    // For now, return placeholder data
    return {
      medianPrice: 350000,
      priceChange30d: 0.5,
      priceChange90d: 2.1,
      daysOnMarket: 28,
      inventory: 156,
      demandLevel: "MODERATE",
    };
  }

  /**
   * Create report from valuation result
   */
  async createReport(
    appraisalRequestId: string,
    valuation: ValuationResult,
    reportType: "AI_REPORT" | "AI_REPORT_WITH_ONSITE" | "CERTIFIED_APPRAISAL"
  ): Promise<Report> {
    const report = await prisma.report.create({
      data: {
        type: reportType,
        valueEstimate: valuation.valueEstimate,
        valueRangeMin: valuation.valueRangeMin,
        valueRangeMax: valuation.valueRangeMax,
        fastSaleEstimate: valuation.fastSaleEstimate,
        confidenceScore: valuation.confidenceScore,
        comps: JSON.parse(JSON.stringify(valuation.comps)),
        compsCount: valuation.comps.length,
        riskFlags: JSON.parse(JSON.stringify(valuation.riskFlags)),
        riskScore: this.calculateRiskScore(valuation.riskFlags),
        aiAnalysis: JSON.parse(JSON.stringify(valuation.aiAnalysis)),
        marketTrends: JSON.parse(JSON.stringify(valuation.marketTrends)),
      },
    });

    // Update appraisal request
    await prisma.appraisalRequest.update({
      where: { id: appraisalRequestId },
      data: {
        reportId: report.id,
        status: "READY",
        completedAt: new Date(),
      },
    });

    return report;
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(riskFlags: RiskFlag[]): number {
    let score = 0;
    for (const flag of riskFlags) {
      if (flag.severity === "HIGH") score += 30;
      else if (flag.severity === "MEDIUM") score += 15;
      else score += 5;
    }
    return Math.min(100, score);
  }
}

export const valuationEngine = new ValuationEngine();
