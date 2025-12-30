/**
 * AI Analyzer
 * AI-powered property analysis and insights using OpenAI GPT-4
 */

import type { Property } from "@prisma/client";
import type { ComparableProperty, AIAnalysis } from "./index";
import type { ValueResult } from "./value-calculator";
import * as openai from "@/shared/lib/openai";

/**
 * AI analyzer class - uses GPT-4 for property analysis
 */
class AIAnalyzer {
  /**
   * Generate AI analysis for a property
   */
  async analyze(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): Promise<AIAnalysis> {
    try {
      // Try OpenAI GPT-4 analysis first
      const aiResult = await this.analyzeWithOpenAI(property, comps, valueResult);
      if (aiResult) {
        return aiResult;
      }
    } catch (error) {
      console.error("OpenAI analysis failed, falling back to rule-based:", error);
    }

    // Fallback to rule-based analysis
    return this.analyzeWithRules(property, comps, valueResult);
  }

  /**
   * Analyze property using OpenAI GPT-4
   */
  private async analyzeWithOpenAI(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): Promise<AIAnalysis | null> {
    // Prepare input for OpenAI analysis
    const input: openai.PropertyAnalysisInput = {
      address: property.addressLine1,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      propertyType: property.propertyType,
      sqft: property.sqft,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      yearBuilt: property.yearBuilt,
      lotSize: property.lotSizeSqft,
      estimatedValue: valueResult.estimate,
      comparables: comps.map(comp => ({
        address: comp.address,
        salePrice: comp.salePrice,
        sqft: comp.sqft,
        bedrooms: comp.bedrooms,
        bathrooms: comp.bathrooms,
        yearBuilt: comp.yearBuilt,
        distance: comp.distance,
      })),
    };

    // Call OpenAI
    const result = await openai.analyzeProperty(input);

    return {
      summary: result.summary,
      strengths: result.strengths,
      concerns: result.concerns,
      marketPosition: result.marketPosition,
      investmentPotential: result.investmentPotential,
    };
  }

  /**
   * Fallback: Analyze property using rules
   */
  private analyzeWithRules(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): AIAnalysis {
    const strengths = this.identifyStrengths(property, comps, valueResult);
    const concerns = this.identifyConcerns(property, comps, valueResult);
    const marketPosition = this.analyzeMarketPosition(property, comps, valueResult);
    const investmentPotential = this.assessInvestmentPotential(property, comps, valueResult);
    const summary = this.generateSummary(property, valueResult, strengths, concerns);

    return {
      summary,
      strengths,
      concerns,
      marketPosition,
      investmentPotential,
    };
  }

  /**
   * Identify property strengths (rule-based fallback)
   */
  private identifyStrengths(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): string[] {
    const strengths: string[] = [];
    const currentYear = new Date().getFullYear();

    // Location-based strengths
    const highValueCounties = ["Travis", "Collin", "Denton", "Fort Bend"];
    if (highValueCounties.includes(property.county)) {
      strengths.push(`Located in ${property.county} County, a high-demand market`);
    }

    // Age-based strengths
    if (property.yearBuilt && currentYear - property.yearBuilt < 10) {
      strengths.push("Newer construction with modern features and systems");
    }

    // Size-based strengths
    if (property.sqft && property.sqft > 2500) {
      strengths.push("Above-average square footage for the area");
    }

    // Bedroom count
    if (property.bedrooms && property.bedrooms >= 4) {
      strengths.push("4+ bedrooms appeals to families with broader buyer pool");
    }

    // Price positioning
    const avgCompPrice = comps.reduce((sum, c) => sum + c.adjustedPrice, 0) / comps.length;
    if (valueResult.estimate < avgCompPrice * 0.95) {
      strengths.push("Priced competitively relative to comparable sales");
    }

    // Good comp coverage
    if (comps.length >= 5) {
      strengths.push("Strong comparable sales data supports valuation");
    }

    // High similarity scores
    const avgSimilarity = comps.reduce((sum, c) => sum + c.similarityScore, 0) / comps.length;
    if (avgSimilarity >= 85) {
      strengths.push("Highly comparable properties found nearby");
    }

    // Lot size
    if (property.lotSizeSqft && property.lotSizeSqft > 10000) {
      strengths.push("Larger than typical lot size for the area");
    }

    return strengths.slice(0, 5);
  }

  /**
   * Identify potential concerns (rule-based fallback)
   */
  private identifyConcerns(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): string[] {
    const concerns: string[] = [];
    const currentYear = new Date().getFullYear();

    // Age-based concerns
    if (property.yearBuilt && currentYear - property.yearBuilt > 40) {
      concerns.push("Older property may require updates to major systems");
    }

    // Limited comps
    if (comps.length < 4) {
      concerns.push("Limited comparable sales increases valuation uncertainty");
    }

    // Old comps
    const recentComps = comps.filter((c) => {
      const monthsAgo = (Date.now() - new Date(c.saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 6;
    });
    if (recentComps.length < 2) {
      concerns.push("Most comparable sales are over 6 months old");
    }

    // Wide value range
    const rangePercent = (valueResult.rangeMax - valueResult.rangeMin) / valueResult.estimate;
    if (rangePercent > 0.12) {
      concerns.push("Higher than typical valuation uncertainty");
    }

    // Low similarity
    const avgSimilarity = comps.reduce((sum, c) => sum + c.similarityScore, 0) / comps.length;
    if (avgSimilarity < 75) {
      concerns.push("Property characteristics differ from area norms");
    }

    // Missing data
    if (!property.sqft || !property.yearBuilt) {
      concerns.push("Missing property data limits valuation accuracy");
    }

    // Small lot
    if (property.lotSizeSqft && property.lotSizeSqft < 5000) {
      concerns.push("Smaller lot size may limit buyer appeal");
    }

    return concerns.slice(0, 4);
  }

  /**
   * Analyze market position (rule-based fallback)
   */
  private analyzeMarketPosition(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): string {
    const avgCompPrice = comps.reduce((sum, c) => sum + c.adjustedPrice, 0) / comps.length;
    const percentDiff = ((valueResult.estimate - avgCompPrice) / avgCompPrice) * 100;

    if (percentDiff < -5) {
      return `This property is positioned approximately ${Math.abs(percentDiff).toFixed(0)}% below the average comparable sale price, suggesting potential value opportunity or reflecting condition/feature differences.`;
    } else if (percentDiff > 5) {
      return `This property is positioned approximately ${percentDiff.toFixed(0)}% above the average comparable sale price, reflecting premium features, condition, or location advantages.`;
    } else {
      return `This property is competitively positioned within the market, with value closely aligned with recent comparable sales in the area.`;
    }
  }

  /**
   * Assess investment potential (rule-based fallback)
   */
  private assessInvestmentPotential(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): string {
    const factors: string[] = [];

    // Market strength
    const highGrowthCounties = ["Travis", "Collin", "Denton", "Fort Bend", "Williamson"];
    if (highGrowthCounties.includes(property.county)) {
      factors.push("strong market growth potential");
    }

    // Value vs fast sale spread
    const upside = ((valueResult.estimate - valueResult.fastSale) / valueResult.fastSale) * 100;
    if (upside > 12) {
      factors.push(`${upside.toFixed(0)}% potential upside from distressed purchase price`);
    }

    // Property type
    if (property.propertyType === "SINGLE_FAMILY") {
      factors.push("single-family homes maintain consistent demand");
    } else if (property.propertyType === "MULTI_FAMILY") {
      factors.push("multi-family offers rental income potential");
    }

    // Age/condition opportunity
    const currentYear = new Date().getFullYear();
    if (property.yearBuilt && currentYear - property.yearBuilt > 25 && currentYear - property.yearBuilt < 50) {
      factors.push("renovation opportunity for value-add strategy");
    }

    if (factors.length === 0) {
      return "Standard investment profile with typical market characteristics.";
    }

    return `Investment considerations include ${factors.join(", ")}.`;
  }

  /**
   * Generate executive summary (rule-based fallback)
   */
  private generateSummary(
    property: Property,
    valueResult: ValueResult,
    strengths: string[],
    concerns: string[]
  ): string {
    const propertyType = property.propertyType.replace("_", " ").toLowerCase();

    let summary = `This ${propertyType} property at ${property.addressFull} has an estimated market value of $${valueResult.estimate.toLocaleString()}, with a likely range of $${valueResult.rangeMin.toLocaleString()} to $${valueResult.rangeMax.toLocaleString()}.`;

    if (strengths.length > 0) {
      summary += ` Key strengths include ${strengths[0].toLowerCase()}.`;
    }

    if (concerns.length > 0) {
      summary += ` Note that ${concerns[0].toLowerCase()}.`;
    }

    summary += ` For a quick sale (90 days or less), a price point around $${valueResult.fastSale.toLocaleString()} is recommended.`;

    return summary;
  }
}

export const aiAnalyzer = new AIAnalyzer();
