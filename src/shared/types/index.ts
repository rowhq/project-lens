// Re-export Prisma types for convenience
export type {
  User,
  Organization,
  Property,
  AppraisalRequest,
  Report,
  Job,
  Evidence,
  AppraiserProfile,
  Payment,
  Dispute,
  Notification,
  AuditLog,
} from "@prisma/client";

// User roles
export type UserRole = "CLIENT" | "APPRAISER" | "ADMIN" | "SUPER_ADMIN";

// Appraisal statuses
export type AppraisalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_PROGRESS"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "CANCELLED";

// Report types
export type ReportType = "AI_REPORT" | "ON_SITE" | "CERTIFIED";

// Job statuses
export type JobStatus =
  | "PENDING_DISPATCH"
  | "DISPATCHED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

// Property types
export type PropertyType =
  | "SINGLE_FAMILY"
  | "CONDO"
  | "TOWNHOUSE"
  | "MULTI_FAMILY"
  | "COMMERCIAL"
  | "LAND";

// Evidence categories
export type EvidenceCategory =
  | "FRONT_EXTERIOR"
  | "REAR_EXTERIOR"
  | "STREET_VIEW"
  | "INTERIOR"
  | "DAMAGE"
  | "OTHER";

// Payment types
export type PaymentType = "CHARGE" | "PAYOUT" | "REFUND" | "SUBSCRIPTION";

// Payment statuses
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

// Dispute types
export type DisputeType = "VALUATION" | "SERVICE" | "BILLING" | "OTHER";

// Dispute priorities
export type DisputePriority = "LOW" | "MEDIUM" | "HIGH";

// Dispute statuses
export type DisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";

// License levels
export type LicenseLevel = "TRAINEE" | "LICENSED" | "CERTIFIED" | "GENERAL";

// Verification statuses
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

// Subscription tiers (matches Prisma OrganizationPlan enum)
export type SubscriptionTier =
  | "FREE_TRIAL"
  | "STARTER"
  | "PROFESSIONAL"
  | "ENTERPRISE";

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Valuation types
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
  aiAnalysis?: AIAnalysis;
  marketTrends?: MarketTrends;
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
  priceChange: number;
  daysOnMarket: number;
  inventoryLevel: string;
}

// Dispatch types
export interface DispatchResult {
  success: boolean;
  jobId: string;
  matchedAppraisers: MatchedAppraiser[];
  dispatchedTo?: string;
  message: string;
}

export interface MatchedAppraiser {
  userId: string;
  distance: number;
  score: number;
  estimatedArrival: number;
}

// Coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Address
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  country?: string;
  formatted?: string;
}
