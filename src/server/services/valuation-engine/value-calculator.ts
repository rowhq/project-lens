/**
 * Value Calculator
 * Calculates property value from comparable sales
 */

import type { Property } from "@prisma/client";
import type { ComparableProperty } from "./index";

export interface ValueResult {
  estimate: number;
  rangeMin: number;
  rangeMax: number;
  fastSale: number;
  methodology: string;
  pricePerSqft: number;
}

/**
 * Value calculator class
 */
class ValueCalculator {
  /**
   * Calculate property value from comps
   */
  calculate(property: Property, comps: ComparableProperty[]): ValueResult {
    if (comps.length === 0) {
      return this.fallbackEstimate(property);
    }

    // Weight comps by similarity score
    const weightedPrices = this.calculateWeightedAverage(comps);

    // Calculate price per sqft
    const pricePerSqft = this.calculatePricePerSqft(comps);

    // Calculate estimate using multiple methods
    const salesComparisonValue = weightedPrices;
    const pricePerSqftValue = pricePerSqft * (property.sqft || 1800);

    // Blend methods (70% sales comparison, 30% price per sqft)
    const estimate = Math.round(
      salesComparisonValue * 0.7 + pricePerSqftValue * 0.3
    );

    // Calculate range based on comp variance
    const { rangeMin, rangeMax } = this.calculateRange(comps, estimate);

    // Fast sale estimate (typically 85-92% of market value)
    const fastSale = Math.round(estimate * 0.88);

    return {
      estimate,
      rangeMin,
      rangeMax,
      fastSale,
      methodology: "Sales Comparison Approach with Price Per Sqft Validation",
      pricePerSqft,
    };
  }

  /**
   * Calculate weighted average of adjusted comp prices
   */
  private calculateWeightedAverage(comps: ComparableProperty[]): number {
    const totalWeight = comps.reduce((sum, comp) => sum + comp.similarityScore, 0);

    const weightedSum = comps.reduce(
      (sum, comp) => sum + comp.adjustedPrice * comp.similarityScore,
      0
    );

    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Calculate average price per sqft from comps
   */
  private calculatePricePerSqft(comps: ComparableProperty[]): number {
    const prices = comps.map((comp) => comp.salePrice / comp.sqft);

    // Remove outliers (outside 1.5 IQR)
    const sorted = [...prices].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const filtered = prices.filter((p) => p >= lowerBound && p <= upperBound);

    return Math.round(
      filtered.reduce((sum, p) => sum + p, 0) / filtered.length
    );
  }

  /**
   * Calculate value range based on comp variance
   */
  private calculateRange(
    comps: ComparableProperty[],
    estimate: number
  ): { rangeMin: number; rangeMax: number } {
    const prices = comps.map((comp) => comp.adjustedPrice);

    // Calculate standard deviation
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance =
      prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    // Range is typically estimate +/- 5-10%
    const variancePercent = Math.min(0.1, stdDev / mean);

    return {
      rangeMin: Math.round(estimate * (1 - variancePercent)),
      rangeMax: Math.round(estimate * (1 + variancePercent)),
    };
  }

  /**
   * Fallback estimate when no comps available
   */
  private fallbackEstimate(property: Property): ValueResult {
    const sqft = property.sqft || 1800;
    const yearBuilt = property.yearBuilt || 2000;
    const age = new Date().getFullYear() - yearBuilt;

    // Base price per sqft by property type
    let basePricePerSqft: number;
    switch (property.propertyType) {
      case "SINGLE_FAMILY":
        basePricePerSqft = 175;
        break;
      case "CONDO":
        basePricePerSqft = 195;
        break;
      case "TOWNHOUSE":
        basePricePerSqft = 185;
        break;
      case "MULTI_FAMILY":
        basePricePerSqft = 145;
        break;
      case "COMMERCIAL":
        basePricePerSqft = 225;
        break;
      case "LAND":
        const lotSize = property.lotSizeSqft || 10000;
        const landValue = lotSize * 4;
        return {
          estimate: landValue,
          rangeMin: Math.round(landValue * 0.8),
          rangeMax: Math.round(landValue * 1.2),
          fastSale: Math.round(landValue * 0.75),
          methodology: "Land Value Estimation (Limited Data)",
          pricePerSqft: 4,
        };
      default:
        basePricePerSqft = 170;
    }

    // Age depreciation (0.5% per year, max 25%)
    const ageAdjustment = Math.max(0.75, 1 - age * 0.005);

    const pricePerSqft = Math.round(basePricePerSqft * ageAdjustment);
    const estimate = Math.round(sqft * pricePerSqft);

    return {
      estimate,
      rangeMin: Math.round(estimate * 0.85),
      rangeMax: Math.round(estimate * 1.15),
      fastSale: Math.round(estimate * 0.82),
      methodology: "Automated Valuation Model (Limited Comparable Data)",
      pricePerSqft,
    };
  }
}

export const valueCalculator = new ValueCalculator();
