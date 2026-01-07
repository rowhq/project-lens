/**
 * Pricing Engine
 * Calculates prices for appraisals and job payouts based on configurable rules
 */

import { prisma } from "@/server/db/prisma";
import type { PropertyType, JobType, PricingRule } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { PRICING } from "@/shared/config/constants";

// ============================================
// Types
// ============================================

export type ReportType =
  | "AI_REPORT"
  | "AI_REPORT_WITH_ONSITE"
  | "CERTIFIED_APPRAISAL";

export interface CalculateAppraisalPriceInput {
  propertyType: PropertyType;
  county: string;
  state?: string;
  requestedType: ReportType;
}

export interface CalculateAppraisalPriceResult {
  basePrice: number;
  countyMultiplier: number;
  finalPrice: number;
  breakdown: PriceBreakdown;
}

export interface PriceBreakdown {
  baseAmount: number;
  countyAdjustment: number;
  total: number;
  rulesApplied: string[];
}

export interface CalculateJobPayoutInput {
  jobType: JobType;
  county: string;
  state?: string;
  basePrice: number;
}

export interface CalculateJobPayoutResult {
  payoutAmount: number;
  payoutPercent: number;
  platformFee: number;
  platformFeePercent: number;
}

export interface GetPricingRulesFilters {
  ruleType?: string;
  propertyType?: PropertyType;
  jobType?: JobType;
  county?: string;
  state?: string;
  isActive?: boolean;
}

// ============================================
// Constants
// ============================================

// Default prices if no rules found (fallback) - uses centralized config
// Note: AI_REPORT is 0 because it's included in subscription plans
const DEFAULT_PRICES: Record<ReportType, number> = {
  AI_REPORT: 0, // Included in subscription
  AI_REPORT_WITH_ONSITE: PRICING.ON_SITE,
  CERTIFIED_APPRAISAL: PRICING.CERTIFIED,
};

// Default payout percentages
const DEFAULT_APPRAISER_PAYOUT_PERCENT = 70; // 70% to appraiser
const DEFAULT_PLATFORM_FEE_PERCENT = 30; // 30% platform fee

// Default county multiplier
const DEFAULT_COUNTY_MULTIPLIER = 1.0;

// ============================================
// Helper Functions
// ============================================

/**
 * Convert ReportType to JobType for matching pricing rules
 */
function reportTypeToJobType(requestedType: ReportType): JobType | null {
  switch (requestedType) {
    case "AI_REPORT_WITH_ONSITE":
      return "ONSITE_PHOTOS";
    case "CERTIFIED_APPRAISAL":
      return "CERTIFIED_APPRAISAL";
    case "AI_REPORT":
    default:
      return null; // AI_REPORT doesn't require a job
  }
}

/**
 * Convert Decimal to number safely
 */
function decimalToNumber(value: Decimal | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
}

/**
 * Check if a pricing rule is currently valid based on dates
 */
function isRuleValid(rule: PricingRule): boolean {
  const now = new Date();

  if (!rule.isActive) {
    return false;
  }

  if (rule.validFrom && now < rule.validFrom) {
    return false;
  }

  if (rule.validTo && now > rule.validTo) {
    return false;
  }

  return true;
}

// ============================================
// Main Functions
// ============================================

/**
 * Calculate the price for an appraisal request
 *
 * @param params - The parameters for calculating the price
 * @returns The calculated price with breakdown
 *
 * @example
 * const result = await calculateAppraisalPrice({
 *   propertyType: "SINGLE_FAMILY",
 *   county: "Travis",
 *   requestedType: "AI_REPORT",
 * });
 * console.log(result.finalPrice); // e.g., 99.00
 */
export async function calculateAppraisalPrice(
  params: CalculateAppraisalPriceInput,
): Promise<CalculateAppraisalPriceResult> {
  const { propertyType, county, state = "TX", requestedType } = params;
  const jobType = reportTypeToJobType(requestedType);
  const rulesApplied: string[] = [];

  // Step 1: Find base price rule
  let basePrice = DEFAULT_PRICES[requestedType];

  const basePriceRules = await prisma.pricingRule.findMany({
    where: {
      ruleType: "base_price",
      isActive: true,
      OR: [
        // Match exact property type and job type
        { propertyType, jobType },
        // Match property type only
        { propertyType, jobType: null },
        // Match job type only
        { propertyType: null, jobType },
        // Global base price
        { propertyType: null, jobType: null },
      ],
    },
    orderBy: [
      // Prefer more specific rules
      { propertyType: "desc" },
      { jobType: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Find the most specific valid base price rule
  for (const rule of basePriceRules) {
    if (isRuleValid(rule) && rule.basePrice) {
      // Check if this rule matches our criteria (more specific = better)
      const matchesPropertyType = rule.propertyType === propertyType;
      const matchesJobType = rule.jobType === jobType;

      if (matchesPropertyType && matchesJobType) {
        // Exact match - highest priority
        basePrice = decimalToNumber(rule.basePrice);
        rulesApplied.push(`base_price:${rule.id} (exact match)`);
        break;
      } else if (matchesPropertyType || matchesJobType) {
        // Partial match
        basePrice = decimalToNumber(rule.basePrice);
        rulesApplied.push(`base_price:${rule.id} (partial match)`);
        break;
      } else if (!rule.propertyType && !rule.jobType) {
        // Global fallback
        basePrice = decimalToNumber(rule.basePrice);
        rulesApplied.push(`base_price:${rule.id} (global)`);
        break;
      }
    }
  }

  // Step 2: Find county multiplier
  let countyMultiplier = DEFAULT_COUNTY_MULTIPLIER;

  const countyRules = await prisma.pricingRule.findMany({
    where: {
      ruleType: "county_multiplier",
      isActive: true,
      OR: [
        // Match exact county and state
        { county, state },
        // Match county only
        { county, state: null },
        // Match state only (fallback)
        { county: null, state },
      ],
    },
    orderBy: [{ county: "desc" }, { state: "desc" }, { createdAt: "desc" }],
  });

  for (const rule of countyRules) {
    if (isRuleValid(rule) && rule.multiplier) {
      const matchesCounty =
        rule.county?.toLowerCase() === county?.toLowerCase();
      const matchesState = rule.state?.toUpperCase() === state?.toUpperCase();

      if (matchesCounty && matchesState) {
        countyMultiplier = rule.multiplier;
        rulesApplied.push(`county_multiplier:${rule.id} (exact)`);
        break;
      } else if (matchesCounty) {
        countyMultiplier = rule.multiplier;
        rulesApplied.push(`county_multiplier:${rule.id} (county)`);
        break;
      } else if (matchesState && !rule.county) {
        countyMultiplier = rule.multiplier;
        rulesApplied.push(`county_multiplier:${rule.id} (state)`);
        break;
      }
    }
  }

  // Step 3: Calculate final price
  const countyAdjustment = basePrice * (countyMultiplier - 1);
  let finalPrice = basePrice * countyMultiplier;

  // Step 4: Apply min/max constraints if any rule has them
  const constraintRules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [{ minPrice: { not: null } }, { maxPrice: { not: null } }],
        },
        {
          OR: [
            { propertyType, jobType },
            { propertyType, jobType: null },
            { propertyType: null, jobType },
            { propertyType: null, jobType: null },
          ],
        },
      ],
    },
  });

  for (const rule of constraintRules) {
    if (!isRuleValid(rule)) continue;

    if (rule.minPrice && finalPrice < decimalToNumber(rule.minPrice)) {
      finalPrice = decimalToNumber(rule.minPrice);
      rulesApplied.push(`min_price:${rule.id}`);
    }

    if (rule.maxPrice && finalPrice > decimalToNumber(rule.maxPrice)) {
      finalPrice = decimalToNumber(rule.maxPrice);
      rulesApplied.push(`max_price:${rule.id}`);
    }
  }

  // Round to 2 decimal places
  finalPrice = Math.round(finalPrice * 100) / 100;

  return {
    basePrice,
    countyMultiplier,
    finalPrice,
    breakdown: {
      baseAmount: basePrice,
      countyAdjustment: Math.round(countyAdjustment * 100) / 100,
      total: finalPrice,
      rulesApplied,
    },
  };
}

/**
 * Calculate the payout amount for an appraiser job
 *
 * @param params - The parameters for calculating the payout
 * @returns The calculated payout with platform fee breakdown
 *
 * @example
 * const result = await calculateJobPayout({
 *   jobType: "ONSITE_PHOTOS",
 *   county: "Travis",
 *   basePrice: 249.00,
 * });
 * console.log(result.payoutAmount); // e.g., 174.30 (70%)
 */
export async function calculateJobPayout(
  params: CalculateJobPayoutInput,
): Promise<CalculateJobPayoutResult> {
  const { jobType, county, state = "TX", basePrice } = params;

  // Find payout percentage rule
  let payoutPercent = DEFAULT_APPRAISER_PAYOUT_PERCENT;
  let platformFeePercent = DEFAULT_PLATFORM_FEE_PERCENT;

  const payoutRules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      appraiserPayoutPercent: { not: null },
      OR: [
        // Match job type and county
        { jobType, county, state },
        { jobType, county, state: null },
        // Match job type only
        { jobType, county: null },
        // Match county only
        { jobType: null, county, state },
        { jobType: null, county, state: null },
        // Global payout rule
        { jobType: null, county: null },
      ],
    },
    orderBy: [
      { jobType: "desc" },
      { county: "desc" },
      { state: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Find the most specific valid payout rule
  for (const rule of payoutRules) {
    if (!isRuleValid(rule) || !rule.appraiserPayoutPercent) continue;

    const matchesJobType = rule.jobType === jobType;
    const matchesCounty = rule.county?.toLowerCase() === county?.toLowerCase();
    const matchesState = rule.state?.toUpperCase() === state?.toUpperCase();

    // Check specificity (more specific = higher priority)
    if (matchesJobType && matchesCounty && matchesState) {
      payoutPercent = rule.appraiserPayoutPercent;
      if (rule.platformFeePercent) {
        platformFeePercent = rule.platformFeePercent;
      }
      break;
    } else if (matchesJobType && matchesCounty) {
      payoutPercent = rule.appraiserPayoutPercent;
      if (rule.platformFeePercent) {
        platformFeePercent = rule.platformFeePercent;
      }
      break;
    } else if (matchesJobType || matchesCounty) {
      payoutPercent = rule.appraiserPayoutPercent;
      if (rule.platformFeePercent) {
        platformFeePercent = rule.platformFeePercent;
      }
      break;
    } else if (!rule.jobType && !rule.county) {
      // Global fallback
      payoutPercent = rule.appraiserPayoutPercent;
      if (rule.platformFeePercent) {
        platformFeePercent = rule.platformFeePercent;
      }
      break;
    }
  }

  // Calculate amounts
  const payoutAmount =
    Math.round(((basePrice * payoutPercent) / 100) * 100) / 100;
  const platformFee =
    Math.round(((basePrice * platformFeePercent) / 100) * 100) / 100;

  return {
    payoutAmount,
    payoutPercent,
    platformFee,
    platformFeePercent,
  };
}

/**
 * Get pricing rules with optional filters (for Admin UI)
 *
 * @param filters - Optional filters to apply
 * @returns Array of matching pricing rules
 *
 * @example
 * // Get all active rules
 * const rules = await getPricingRules({ isActive: true });
 *
 * // Get county multipliers for Texas
 * const txRules = await getPricingRules({
 *   ruleType: "county_multiplier",
 *   state: "TX"
 * });
 */
export async function getPricingRules(
  filters: GetPricingRulesFilters = {},
): Promise<PricingRule[]> {
  const { ruleType, propertyType, jobType, county, state, isActive } = filters;

  const where: Record<string, unknown> = {};

  if (ruleType !== undefined) {
    where.ruleType = ruleType;
  }

  if (propertyType !== undefined) {
    where.propertyType = propertyType;
  }

  if (jobType !== undefined) {
    where.jobType = jobType;
  }

  if (county !== undefined) {
    where.county = county;
  }

  if (state !== undefined) {
    where.state = state;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return prisma.pricingRule.findMany({
    where,
    orderBy: [
      { ruleType: "asc" },
      { propertyType: "asc" },
      { county: "asc" },
      { createdAt: "desc" },
    ],
  });
}

/**
 * Get the default price for a report type (used as fallback)
 */
export function getDefaultPrice(requestedType: ReportType): number {
  return DEFAULT_PRICES[requestedType];
}

// Export pricing engine as named object for consistency with other services
export const pricingEngine = {
  calculateAppraisalPrice,
  calculateJobPayout,
  getPricingRules,
  getDefaultPrice,
};
