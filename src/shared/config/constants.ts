// App constants
export const APP_NAME = "TruPlat";
export const APP_DESCRIPTION =
  "AI-Powered Property Valuations + On-Site Verification";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://truplat.com";

// SLA Configuration (in hours)
export const SLA_CONFIG = {
  AI_REPORT: 0.00833, // ~30 seconds
  ON_SITE: 48,
  CERTIFIED: 72,
  DISPATCH: {
    NORMAL: 1,
    URGENT: 0.5,
    CRITICAL: 0.25,
  },
  ACCEPTANCE: {
    NORMAL: 4,
    URGENT: 2,
    CRITICAL: 1,
  },
} as const;

// Add-on service pricing (USD) - charged per service
// Note: AI Reports are INCLUDED in subscription plans, not sold separately
export const PRICING = {
  ON_SITE: 249, // On-Site Verification add-on
  CERTIFIED: 499, // Certified Appraisal add-on
  RUSH_MULTIPLIER: 1.5,
} as const;

// Internal cost reference (not customer-facing pricing)
export const INTERNAL_COSTS = {
  AI_REPORT_COGS: 1, // ~$1 per AI report (API + compute)
} as const;

// Prices in cents for Stripe (add-on services only)
export const PRICING_CENTS = {
  ON_SITE: PRICING.ON_SITE * 100,
  CERTIFIED: PRICING.CERTIFIED * 100,
} as const;

// Appraiser payout rates
export const PAYOUT_RATES = {
  ON_SITE: {
    base: 75,
    percentage: 50,
  },
  CERTIFIED: {
    base: 225,
    percentage: 50,
  },
} as const;

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE_TRIAL: {
    name: "Free Trial",
    price: 0,
    reportsPerMonth: 5,
    features: ["AI Reports", "Email Support", "Basic Analytics"],
  },
  STARTER: {
    name: "Starter",
    price: 0,
    reportsPerMonth: 5,
    features: ["AI Reports", "Email Support", "Basic Analytics"],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: 99,
    reportsPerMonth: 50,
    features: [
      "AI Reports",
      "On-Site Verification",
      "Priority Support",
      "Advanced Analytics",
      "Team Collaboration",
      "API Access",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 299,
    reportsPerMonth: -1, // Unlimited
    features: [
      "Unlimited AI Reports",
      "All Report Types",
      "Dedicated Support",
      "Custom Integrations",
      "White-label Reports",
      "SLA Guarantee",
    ],
  },
} as const;

// Texas counties with population centers
export const TEXAS_METRO_AREAS = {
  "Austin-Round Rock": {
    counties: ["Travis", "Williamson", "Hays", "Bastrop", "Caldwell"],
    population: 2300000,
  },
  "Houston-The Woodlands-Sugar Land": {
    counties: ["Harris", "Fort Bend", "Montgomery", "Brazoria", "Galveston"],
    population: 7200000,
  },
  "Dallas-Fort Worth-Arlington": {
    counties: [
      "Dallas",
      "Tarrant",
      "Collin",
      "Denton",
      "Ellis",
      "Kaufman",
      "Rockwall",
    ],
    population: 7700000,
  },
  "San Antonio-New Braunfels": {
    counties: ["Bexar", "Comal", "Guadalupe", "Medina"],
    population: 2600000,
  },
  "El Paso": {
    counties: ["El Paso"],
    population: 870000,
  },
  "McAllen-Edinburg-Mission": {
    counties: ["Hidalgo"],
    population: 870000,
  },
} as const;

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  SINGLE_FAMILY: "Single Family",
  CONDO: "Condominium",
  TOWNHOUSE: "Townhouse",
  MULTI_FAMILY: "Multi-Family",
  COMMERCIAL: "Commercial",
  LAND: "Land/Vacant",
};

// Report type labels
// Maps to Prisma ReportType enum: AI_REPORT, AI_REPORT_WITH_ONSITE, CERTIFIED_APPRAISAL
export const REPORT_TYPE_LABELS: Record<string, string> = {
  AI_REPORT: "AI Report",
  AI_REPORT_WITH_ONSITE: "AI Report + On-Site",
  ON_SITE: "On-Site Verification",
  CERTIFIED: "Certified Appraisal",
  CERTIFIED_APPRAISAL: "Certified Appraisal",
};

// Job type labels
// Maps to Prisma JobType enum: ONSITE_PHOTOS, CERTIFIED_APPRAISAL
// Note: AI Reports don't create jobs - they're generated instantly
export const JOB_TYPE_LABELS: Record<string, string> = {
  ONSITE_PHOTOS: "On-Site Verification",
  CERTIFIED_APPRAISAL: "Certified Appraisal",
};

/**
 * ReportType to JobType mapping:
 * - AI_REPORT → No job (AI-only, instant)
 * - AI_REPORT_WITH_ONSITE → ONSITE_PHOTOS job
 * - CERTIFIED_APPRAISAL → CERTIFIED_APPRAISAL job
 */
export const REPORT_TO_JOB_TYPE: Record<string, string | null> = {
  AI_REPORT: null,
  AI_REPORT_WITH_ONSITE: "ONSITE_PHOTOS",
  CERTIFIED_APPRAISAL: "CERTIFIED_APPRAISAL",
};

// Status labels and colors
export const STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "gray" },
  SUBMITTED: { label: "Submitted", color: "blue" },
  IN_PROGRESS: { label: "In Progress", color: "yellow" },
  UNDER_REVIEW: { label: "Under Review", color: "purple" },
  COMPLETED: { label: "Completed", color: "green" },
  CANCELLED: { label: "Cancelled", color: "red" },
} as const;

// Evidence categories
export const EVIDENCE_CATEGORIES = [
  { id: "FRONT_EXTERIOR", label: "Front Exterior", required: true },
  { id: "REAR_EXTERIOR", label: "Rear Exterior", required: true },
  { id: "STREET_VIEW", label: "Street View", required: true },
  { id: "INTERIOR", label: "Interior", required: false },
  { id: "DAMAGE", label: "Damage/Issues", required: false },
  { id: "OTHER", label: "Other", required: false },
] as const;

// Appraisal purposes
export const APPRAISAL_PURPOSES = [
  "Purchase",
  "Refinance",
  "Home Equity",
  "Listing/Sale",
  "Estate Planning",
  "Tax Appeal",
  "Divorce Settlement",
  "Insurance",
  "Investment Analysis",
  "Other",
] as const;

// License levels
export const LICENSE_LEVELS = {
  TRAINEE: { label: "Trainee", description: "Under supervision" },
  LICENSED: { label: "Licensed", description: "Residential up to $1M" },
  CERTIFIED: { label: "Certified Residential", description: "All residential" },
  GENERAL: { label: "Certified General", description: "All property types" },
} as const;

// API rate limits
export const RATE_LIMITS = {
  GLOBAL: 100, // requests per minute
  APPRAISAL_CREATE: 10, // per minute
  REPORT_GENERATE: 5, // per minute
  FILE_UPLOAD: 20, // per minute
} as const;

// File size limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PDF_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf"],
} as const;

// Notification channels
export const NOTIFICATION_CHANNELS = {
  IN_APP: "in_app",
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
} as const;

// Study categories for DD Marketplace
export const STUDY_CATEGORIES = {
  APPRAISAL_REPORT: { label: "Appraisal Report", icon: "FileText" },
  SOIL_STUDY: { label: "Soil Study", icon: "Layers" },
  DRAINAGE_STUDY: { label: "Drainage Study", icon: "Droplets" },
  CIVIL_ENGINEERING: { label: "Civil Engineering", icon: "Building2" },
  ENVIRONMENTAL: { label: "Environmental", icon: "Leaf" },
  GEOTECHNICAL: { label: "Geotechnical", icon: "Mountain" },
  STRUCTURAL: { label: "Structural", icon: "Construction" },
  FLOOD_RISK: { label: "Flood Risk", icon: "Waves" },
  ZONING_ANALYSIS: { label: "Zoning Analysis", icon: "Map" },
  SURVEY: { label: "Survey", icon: "Compass" },
  TITLE_REPORT: { label: "Title Report", icon: "ScrollText" },
  OTHER: { label: "Other", icon: "File" },
} as const;

// Insight types for investment opportunities
export const INSIGHT_TYPES = {
  MUNICIPAL_BOND: { label: "Municipal Bond", icon: "Landmark", color: "blue" },
  SCHOOL_CONSTRUCTION: {
    label: "School Construction",
    icon: "GraduationCap",
    color: "green",
  },
  ROAD_PROJECT: { label: "Road Project", icon: "Route", color: "orange" },
  ZONING_CHANGE: { label: "Zoning Change", icon: "MapPin", color: "purple" },
  DEVELOPMENT_PERMIT: {
    label: "Development Permit",
    icon: "FileCheck",
    color: "teal",
  },
  INFRASTRUCTURE: { label: "Infrastructure", icon: "Building", color: "cyan" },
  TAX_INCENTIVE: {
    label: "Tax Incentive",
    icon: "BadgeDollarSign",
    color: "yellow",
  },
} as const;

// Engineer specialties
export const ENGINEER_SPECIALTIES = [
  { id: "soil", label: "Soil Engineering" },
  { id: "drainage", label: "Drainage Engineering" },
  { id: "civil", label: "Civil Engineering" },
  { id: "structural", label: "Structural Engineering" },
  { id: "environmental", label: "Environmental Engineering" },
  { id: "survey", label: "Land Surveying" },
  { id: "geotechnical", label: "Geotechnical Engineering" },
] as const;
