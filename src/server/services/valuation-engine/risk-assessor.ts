/**
 * Risk Assessor
 * Identifies and assesses property valuation risks
 */

import type { Property } from "@prisma/client";
import type { ComparableProperty, RiskFlag } from "./index";
import type { ValueResult } from "./value-calculator";

/**
 * Risk assessor class
 */
class RiskAssessor {
  /**
   * Assess risks for a property valuation
   */
  async assess(
    property: Property,
    comps: ComparableProperty[],
    valueResult: ValueResult
  ): Promise<RiskFlag[]> {
    const risks: RiskFlag[] = [];

    // Check comp quality risks
    risks.push(...this.assessCompRisks(comps));

    // Check property-specific risks
    risks.push(...this.assessPropertyRisks(property));

    // Check market risks
    risks.push(...this.assessMarketRisks(property, valueResult));

    // Check data quality risks
    risks.push(...this.assessDataQualityRisks(property, comps));

    return risks;
  }

  /**
   * Assess risks related to comparable properties
   */
  private assessCompRisks(comps: ComparableProperty[]): RiskFlag[] {
    const risks: RiskFlag[] = [];

    // Insufficient comps
    if (comps.length < 3) {
      risks.push({
        type: "INSUFFICIENT_COMPS",
        severity: "HIGH",
        description: `Only ${comps.length} comparable sales found`,
        recommendation:
          "Consider ordering on-site inspection for additional verification",
      });
    } else if (comps.length < 5) {
      risks.push({
        type: "LIMITED_COMPS",
        severity: "MEDIUM",
        description: `Only ${comps.length} comparable sales found`,
        recommendation: "Value estimate may have wider variance than typical",
      });
    }

    // Old comps
    const recentComps = comps.filter((c) => {
      const monthsAgo =
        (Date.now() - new Date(c.saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 6;
    });

    if (recentComps.length < 2) {
      risks.push({
        type: "STALE_COMPS",
        severity: "MEDIUM",
        description: "Most comparable sales are older than 6 months",
        recommendation:
          "Market conditions may have changed since comparable sales",
      });
    }

    // Low similarity scores
    const avgSimilarity =
      comps.reduce((sum, c) => sum + c.similarityScore, 0) / comps.length;
    if (avgSimilarity < 70) {
      risks.push({
        type: "LOW_SIMILARITY",
        severity: "HIGH",
        description: "Comparable properties have low similarity scores",
        recommendation:
          "Property may be unique in the area; consider certified appraisal",
      });
    } else if (avgSimilarity < 80) {
      risks.push({
        type: "MODERATE_SIMILARITY",
        severity: "LOW",
        description: "Comparable properties have moderate similarity scores",
        recommendation: "Review comparables carefully before making decisions",
      });
    }

    // High price variance in comps
    if (comps.length >= 3) {
      const prices = comps.map((c) => c.adjustedPrice);
      const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance =
        prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
      const coeffOfVariation = Math.sqrt(variance) / mean;

      if (coeffOfVariation > 0.15) {
        risks.push({
          type: "HIGH_COMP_VARIANCE",
          severity: "MEDIUM",
          description: "Significant price variation among comparable sales",
          recommendation:
            "Value estimate has higher uncertainty; consider the full range",
        });
      }
    }

    return risks;
  }

  /**
   * Assess property-specific risks
   */
  private assessPropertyRisks(property: Property): RiskFlag[] {
    const risks: RiskFlag[] = [];
    const currentYear = new Date().getFullYear();

    // Very old property
    if (property.yearBuilt && currentYear - property.yearBuilt > 50) {
      risks.push({
        type: "OLDER_PROPERTY",
        severity: "LOW",
        description: `Property built in ${property.yearBuilt} (${currentYear - property.yearBuilt} years old)`,
        recommendation:
          "Consider on-site inspection to verify condition and updates",
      });
    }

    // Very new property (limited sales history)
    if (property.yearBuilt && currentYear - property.yearBuilt < 2) {
      risks.push({
        type: "NEW_CONSTRUCTION",
        severity: "LOW",
        description: "Recently constructed property with limited sales history",
        recommendation:
          "Value based on similar new construction in the area",
      });
    }

    // Land/vacant property
    if (property.propertyType === "LAND") {
      risks.push({
        type: "LAND_VALUATION",
        severity: "MEDIUM",
        description: "Land valuation has higher uncertainty than improved property",
        recommendation:
          "Consider soil studies, zoning verification, and development potential",
      });
    }

    // Commercial property
    if (property.propertyType === "COMMERCIAL") {
      risks.push({
        type: "COMMERCIAL_COMPLEXITY",
        severity: "MEDIUM",
        description: "Commercial property valuation requires income analysis",
        recommendation:
          "AI report is preliminary; certified appraisal recommended for lending",
      });
    }

    // Missing key property details
    if (!property.sqft) {
      risks.push({
        type: "MISSING_SQFT",
        severity: "HIGH",
        description: "Property square footage not available",
        recommendation:
          "Value estimate less reliable without accurate size data",
      });
    }

    if (!property.yearBuilt) {
      risks.push({
        type: "MISSING_YEAR_BUILT",
        severity: "MEDIUM",
        description: "Year built not available",
        recommendation:
          "Age-related adjustments may not be accurate",
      });
    }

    return risks;
  }

  /**
   * Assess market-related risks
   */
  private assessMarketRisks(
    property: Property,
    valueResult: ValueResult
  ): RiskFlag[] {
    const risks: RiskFlag[] = [];

    // High price per sqft (potential overvaluation)
    if (valueResult.pricePerSqft > 300) {
      risks.push({
        type: "HIGH_PRICE_PER_SQFT",
        severity: "LOW",
        description: `Price per sqft ($${valueResult.pricePerSqft}) is above typical range`,
        recommendation: "Verify property features justify premium pricing",
      });
    }

    // Low price per sqft (potential undervaluation or issues)
    if (valueResult.pricePerSqft < 100) {
      risks.push({
        type: "LOW_PRICE_PER_SQFT",
        severity: "MEDIUM",
        description: `Price per sqft ($${valueResult.pricePerSqft}) is below typical range`,
        recommendation:
          "May indicate condition issues or limited market demand",
      });
    }

    // Wide value range
    const rangePercent =
      (valueResult.rangeMax - valueResult.rangeMin) / valueResult.estimate;
    if (rangePercent > 0.15) {
      risks.push({
        type: "WIDE_VALUE_RANGE",
        severity: "MEDIUM",
        description: "Value range is wider than typical",
        recommendation:
          "Higher uncertainty in estimate; use conservative value for lending",
      });
    }

    return risks;
  }

  /**
   * Assess data quality risks
   */
  private assessDataQualityRisks(
    property: Property,
    comps: ComparableProperty[]
  ): RiskFlag[] {
    const risks: RiskFlag[] = [];

    // All comps from same source/timeframe (potential data issue)
    const uniqueDates = new Set(
      comps.map((c) => new Date(c.saleDate).toISOString().slice(0, 7))
    );
    if (comps.length > 3 && uniqueDates.size < 3) {
      risks.push({
        type: "CONCENTRATED_SALES",
        severity: "LOW",
        description: "Most comparable sales occurred in a short timeframe",
        recommendation:
          "May not reflect current market conditions if market has shifted",
      });
    }

    // Very distant comps
    const avgDistance =
      comps.reduce((sum, c) => sum + c.distance, 0) / comps.length;
    if (avgDistance > 3) {
      risks.push({
        type: "DISTANT_COMPS",
        severity: "MEDIUM",
        description: `Average comparable distance is ${avgDistance.toFixed(1)} miles`,
        recommendation:
          "Location differences may not be fully captured in adjustments",
      });
    }

    return risks;
  }
}

export const riskAssessor = new RiskAssessor();
