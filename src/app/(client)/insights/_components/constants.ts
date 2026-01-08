export type ViewMode = "table" | "map";

export type InsightType =
  | "MUNICIPAL_BOND"
  | "SCHOOL_CONSTRUCTION"
  | "ROAD_PROJECT"
  | "ZONING_CHANGE"
  | "DEVELOPMENT_PERMIT"
  | "INFRASTRUCTURE"
  | "TAX_INCENTIVE";

export const SIGNAL_TYPES: { value: InsightType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Infrastructure" },
  { value: "ROAD_PROJECT", label: "Roads" },
  { value: "SCHOOL_CONSTRUCTION", label: "Schools" },
  { value: "INFRASTRUCTURE", label: "Water/Utilities" },
  { value: "MUNICIPAL_BOND", label: "Municipal Bonds" },
  { value: "ZONING_CHANGE", label: "Zoning" },
  { value: "DEVELOPMENT_PERMIT", label: "Development" },
];

export const BUFFER_OPTIONS = [
  { value: 1, label: "1 mi" },
  { value: 2, label: "2 mi" },
  { value: 3, label: "3 mi" },
  { value: 5, label: "5 mi" },
];

export const COUNTIES = [
  { value: "Harris", label: "Harris County, TX" },
  { value: "Dallas", label: "Dallas County, TX" },
  { value: "Travis", label: "Travis County, TX" },
  { value: "Bexar", label: "Bexar County, TX" },
  { value: "Tarrant", label: "Tarrant County, TX" },
];

export const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const APPRECIATION_PRESETS = [
  { value: "", label: "Any appreciation" },
  { value: "0-10", label: "0-10%" },
  { value: "10-20", label: "10-20%" },
  { value: "20-50", label: "20-50%" },
  { value: "50+", label: "50%+" },
];

export const CORRELATION_PRESETS = [
  { value: "", label: "Any correlation" },
  { value: "0.3", label: "Weak (0.3+)" },
  { value: "0.5", label: "Moderate (0.5+)" },
  { value: "0.7", label: "Strong (0.7+)" },
];

export const DEFAULT_FILTERS = {
  type: "ALL" as InsightType | "ALL",
  county: "Harris",
  bufferMiles: 5,
  search: "",
  status: "" as string,
  appreciationRange: "" as string,
  minCorrelation: "" as string,
  yearFrom: "" as string,
  yearTo: "" as string,
};

// InsightItem type based on Prisma InvestmentInsight model
export interface InsightItem {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  source: string;
  sourceUrl: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  county: string;
  state: string;
  zipCode: string | null;
  impactRadiusMiles: number;
  estimatedValue: unknown;
  fundingAmount: unknown;
  expectedROI: number | null;
  projectYear: number | null;
  parcelsAffected: number | null;
  avgValueChange: number | null;
  lagPeriodYears: number | null;
  correlation: number | null;
  announcedAt: Date | null;
  expectedStart: Date | null;
  expectedEnd: Date | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PENDING";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  distance: number | null;
}

export interface AnalysisMetrics {
  projectsAnalyzed: number;
  avgAppreciation: number;
  medianLag: number;
  topSignalType: string;
  topCorrelation: number;
}
