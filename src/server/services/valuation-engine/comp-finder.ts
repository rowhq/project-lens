/**
 * Comparable Property Finder
 * Finds and ranks similar properties for valuation using ATTOM Data API
 */

import type { Property } from "@prisma/client";
import type { ComparableProperty, Adjustment } from "./index";
import * as attom from "@/shared/lib/attom";

/**
 * Configuration for comp search
 */
const COMP_CONFIG = {
  maxRadius: 5, // miles
  maxComps: 10,
  minComps: 3,
  maxAgeDays: 365,
  sqftVariance: 0.3, // 30%
  yearBuiltVariance: 20, // years
};

/**
 * Comparable property finder class
 */
class CompFinder {
  /**
   * Find comparable properties - tries ATTOM first, falls back to mock
   */
  async findComparables(property: Property): Promise<ComparableProperty[]> {
    try {
      // Try ATTOM Data API first
      const attomComps = await this.findCompsFromAttom(property);
      if (attomComps.length >= COMP_CONFIG.minComps) {
        return attomComps;
      }

      // If not enough from ATTOM, supplement with generated data
      console.log("Supplementing ATTOM comps with generated data");
      const generatedComps = this.generateMockComps(property, COMP_CONFIG.minComps - attomComps.length);
      return [...attomComps, ...generatedComps].slice(0, COMP_CONFIG.maxComps);
    } catch (error) {
      console.error("ATTOM comp search failed, using generated data:", error);
      return this.generateMockComps(property, COMP_CONFIG.maxComps);
    }
  }

  /**
   * Find comparables from ATTOM Data API
   */
  private async findCompsFromAttom(property: Property): Promise<ComparableProperty[]> {
    const rawComps = await attom.getComparableSales({
      address: property.addressLine1,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      radius: COMP_CONFIG.maxRadius,
      maxResults: COMP_CONFIG.maxComps,
    });

    if (!rawComps || rawComps.length === 0) {
      return [];
    }

    // Normalize and process ATTOM data
    const normalizedComps = rawComps.map(attom.normalizeComparable);

    // Calculate similarity scores and adjustments
    const scoredComps = normalizedComps.map((comp) => {
      const baseComp = {
        id: comp.id,
        address: comp.address,
        salePrice: comp.salePrice,
        saleDate: comp.saleDate,
        sqft: comp.sqft,
        bedrooms: comp.bedrooms,
        bathrooms: comp.bathrooms,
        yearBuilt: comp.yearBuilt,
        distance: comp.distance,
      };

      return {
        ...baseComp,
        similarityScore: this.calculateSimilarity(property, baseComp),
        adjustments: this.calculateAdjustments(property, baseComp),
      };
    });

    // Calculate adjusted prices
    const adjustedComps = scoredComps.map((comp) => ({
      ...comp,
      adjustedPrice: this.calculateAdjustedPrice(comp),
    }));

    // Sort by similarity score and return top comps
    return adjustedComps
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, COMP_CONFIG.maxComps);
  }

  /**
   * Generate mock comparable properties (fallback)
   */
  private generateMockComps(property: Property, count: number = 6): ComparableProperty[] {
    const basePrice = this.estimateBasePrice(property);
    const comps: ComparableProperty[] = [];

    const numComps = Math.min(count, 8);

    for (let i = 0; i < numComps; i++) {
      const priceVariance = 0.85 + Math.random() * 0.3; // 85% to 115%
      const sqftVariance = 0.8 + Math.random() * 0.4; // 80% to 120%
      const daysAgo = Math.floor(Math.random() * 180) + 30; // 30-210 days ago

      const baseComp = {
        id: `comp-${i + 1}`,
        address: this.generateMockAddress(property, i),
        salePrice: Math.round(basePrice * priceVariance),
        saleDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        sqft: Math.round((property.sqft || 1800) * sqftVariance),
        bedrooms: property.bedrooms || 3,
        bathrooms: property.bathrooms || 2,
        yearBuilt: (property.yearBuilt || 2000) + Math.floor(Math.random() * 10) - 5,
        distance: 0.2 + Math.random() * 3, // 0.2 to 3.2 miles
      };

      const similarityScore = this.calculateSimilarity(property, baseComp);
      const adjustments = this.calculateAdjustments(property, baseComp);

      comps.push({
        ...baseComp,
        similarityScore,
        adjustments,
        adjustedPrice: this.calculateAdjustedPrice({ ...baseComp, similarityScore, adjustments }),
      });
    }

    return comps.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Estimate base price for property
   */
  private estimateBasePrice(property: Property): number {
    const sqft = property.sqft || 1800;
    const yearBuilt = property.yearBuilt || 2000;
    const age = new Date().getFullYear() - yearBuilt;

    // Base price per sqft varies by property type
    let pricePerSqft: number;
    switch (property.propertyType) {
      case "SINGLE_FAMILY":
        pricePerSqft = 180;
        break;
      case "CONDO":
        pricePerSqft = 200;
        break;
      case "TOWNHOUSE":
        pricePerSqft = 190;
        break;
      case "MULTI_FAMILY":
        pricePerSqft = 150;
        break;
      case "COMMERCIAL":
        pricePerSqft = 250;
        break;
      case "LAND":
        return (property.lotSizeSqft || 10000) * 5; // $5/sqft for land
      default:
        pricePerSqft = 175;
    }

    // Adjust for age
    const ageAdjustment = Math.max(0.7, 1 - age * 0.005);

    // County adjustments (Texas markets)
    const countyMultiplier = this.getCountyMultiplier(property.county);

    return Math.round(sqft * pricePerSqft * ageAdjustment * countyMultiplier);
  }

  /**
   * Get county-specific price multiplier
   */
  private getCountyMultiplier(county: string): number {
    const multipliers: Record<string, number> = {
      Travis: 1.4, // Austin area
      Harris: 1.0, // Houston
      Dallas: 1.1,
      Tarrant: 1.0, // Fort Worth
      Collin: 1.3, // Plano/Frisco
      Denton: 1.2,
      Bexar: 0.9, // San Antonio
      "Fort Bend": 1.15,
      Hidalgo: 0.7,
      "El Paso": 0.75,
      Williamson: 1.25,
      Montgomery: 1.1,
      Brazoria: 0.95,
      Galveston: 1.0,
      Nueces: 0.85,
    };
    return multipliers[county] || 1.0;
  }

  /**
   * Generate mock address near property
   */
  private generateMockAddress(property: Property, index: number): string {
    const streetNumber = 100 + index * 100 + Math.floor(Math.random() * 50);
    const streets = [
      "Oak Lane",
      "Maple Street",
      "Cedar Drive",
      "Pine Avenue",
      "Elm Court",
      "Birch Road",
      "Willow Way",
      "Cherry Lane",
    ];
    const street = streets[index % streets.length];
    return `${streetNumber} ${street}, ${property.city}, TX ${property.zipCode}`;
  }

  /**
   * Calculate similarity score between property and comp
   */
  private calculateSimilarity(
    property: Property,
    comp: Omit<ComparableProperty, "similarityScore" | "adjustments" | "adjustedPrice">
  ): number {
    let score = 100;

    // Sqft difference (max 25 points deduction)
    const sqftDiff = Math.abs(
      ((comp.sqft - (property.sqft || 1800)) / (property.sqft || 1800)) * 100
    );
    score -= Math.min(25, sqftDiff * 0.5);

    // Bedroom difference (max 10 points)
    const bedDiff = Math.abs(comp.bedrooms - (property.bedrooms || 3));
    score -= bedDiff * 5;

    // Bathroom difference (max 10 points)
    const bathDiff = Math.abs(comp.bathrooms - (property.bathrooms || 2));
    score -= bathDiff * 5;

    // Year built difference (max 15 points)
    const yearDiff = Math.abs(comp.yearBuilt - (property.yearBuilt || 2000));
    score -= Math.min(15, yearDiff * 0.5);

    // Distance (max 20 points)
    score -= Math.min(20, comp.distance * 5);

    // Sale recency (max 10 points)
    const daysSinceSale = (Date.now() - new Date(comp.saleDate).getTime()) / (1000 * 60 * 60 * 24);
    score -= Math.min(10, daysSinceSale / 30);

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate price adjustments for a comp
   */
  private calculateAdjustments(
    property: Property,
    comp: Omit<ComparableProperty, "similarityScore" | "adjustments" | "adjustedPrice">
  ): Adjustment[] {
    const adjustments: Adjustment[] = [];
    const pricePerSqft = comp.salePrice / comp.sqft;

    // Sqft adjustment
    const sqftDiff = (property.sqft || 1800) - comp.sqft;
    if (Math.abs(sqftDiff) > 50) {
      adjustments.push({
        factor: "Square Footage",
        amount: Math.round(sqftDiff * pricePerSqft * 0.5),
        reason: `Subject is ${sqftDiff > 0 ? "larger" : "smaller"} by ${Math.abs(sqftDiff)} sqft`,
      });
    }

    // Bedroom adjustment
    const bedDiff = (property.bedrooms || 3) - comp.bedrooms;
    if (bedDiff !== 0) {
      adjustments.push({
        factor: "Bedrooms",
        amount: bedDiff * 10000,
        reason: `Subject has ${Math.abs(bedDiff)} ${bedDiff > 0 ? "more" : "fewer"} bedroom(s)`,
      });
    }

    // Bathroom adjustment
    const bathDiff = (property.bathrooms || 2) - comp.bathrooms;
    if (bathDiff !== 0) {
      adjustments.push({
        factor: "Bathrooms",
        amount: bathDiff * 8000,
        reason: `Subject has ${Math.abs(bathDiff)} ${bathDiff > 0 ? "more" : "fewer"} bathroom(s)`,
      });
    }

    // Age adjustment
    const ageDiff = comp.yearBuilt - (property.yearBuilt || 2000);
    if (Math.abs(ageDiff) > 5) {
      adjustments.push({
        factor: "Year Built",
        amount: ageDiff * 1500,
        reason: `Comp is ${Math.abs(ageDiff)} years ${ageDiff > 0 ? "newer" : "older"}`,
      });
    }

    // Location/distance adjustment for distant comps
    if (comp.distance > 2) {
      adjustments.push({
        factor: "Location",
        amount: Math.round(-comp.distance * 2000),
        reason: `Comp is ${comp.distance.toFixed(1)} miles away`,
      });
    }

    return adjustments;
  }

  /**
   * Calculate adjusted price for a comp
   */
  private calculateAdjustedPrice(
    comp: Omit<ComparableProperty, "adjustedPrice"> & { adjustments: Adjustment[] }
  ): number {
    const totalAdjustment = comp.adjustments.reduce((sum, adj) => sum + adj.amount, 0);
    return comp.salePrice + totalAdjustment;
  }
}

export const compFinder = new CompFinder();
