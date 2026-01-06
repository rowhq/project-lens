"use client";

import { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import {
  MapPin,
  TrendingUp,
  Building2,
  GraduationCap,
  Route,
  Landmark,
  Target,
  Map,
  List,
  ChevronDown,
  ChevronUp,
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Lightbulb,
  Clock,
  ChevronRight,
  Info,
  Search,
  X,
  Download,
  HelpCircle,
  Home,
  SlidersHorizontal,
  Share2,
  Check,
  GitCompare,
  Sparkles,
} from "lucide-react";
import {
  GrowthOpportunityCard,
  GrowthOpportunityCardSkeleton,
} from "@/shared/components/insights";

// Dynamic import for MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/shared/components/common/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-gray-800 animate-pulse clip-notch" />
    ),
  },
);

type ViewMode = "table" | "map";
type InsightType =
  | "MUNICIPAL_BOND"
  | "SCHOOL_CONSTRUCTION"
  | "ROAD_PROJECT"
  | "ZONING_CHANGE"
  | "DEVELOPMENT_PERMIT"
  | "INFRASTRUCTURE"
  | "TAX_INCENTIVE";

const SIGNAL_TYPES: { value: InsightType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Infrastructure" },
  { value: "ROAD_PROJECT", label: "Roads" },
  { value: "SCHOOL_CONSTRUCTION", label: "Schools" },
  { value: "INFRASTRUCTURE", label: "Water/Utilities" },
  { value: "MUNICIPAL_BOND", label: "Municipal Bonds" },
  { value: "ZONING_CHANGE", label: "Zoning" },
  { value: "DEVELOPMENT_PERMIT", label: "Development" },
];

const BUFFER_OPTIONS = [
  { value: 1, label: "1 mi" },
  { value: 2, label: "2 mi" },
  { value: 3, label: "3 mi" },
  { value: 5, label: "5 mi" },
];

const COUNTIES = [
  { value: "Harris", label: "Harris County, TX" },
  { value: "Dallas", label: "Dallas County, TX" },
  { value: "Travis", label: "Travis County, TX" },
  { value: "Bexar", label: "Bexar County, TX" },
  { value: "Tarrant", label: "Tarrant County, TX" },
];

// Status options
const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PENDING", label: "Pending" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Appreciation range presets
const APPRECIATION_PRESETS = [
  { value: "", label: "Any appreciation" },
  { value: "0-10", label: "0-10%" },
  { value: "10-20", label: "10-20%" },
  { value: "20-50", label: "20-50%" },
  { value: "50+", label: "50%+" },
];

// Correlation presets
const CORRELATION_PRESETS = [
  { value: "", label: "Any correlation" },
  { value: "0.3", label: "Weak (0.3+)" },
  { value: "0.5", label: "Moderate (0.5+)" },
  { value: "0.7", label: "Strong (0.7+)" },
];

// Default filter values for reset
const DEFAULT_FILTERS = {
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

export default function InsightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const mapViewRef = useRef<HTMLDivElement>(null);

  // Handler for "View on Map" - switches view and scrolls to map
  const handleViewOnMap = () => {
    setViewMode("map");
    setTimeout(() => {
      mapViewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };
  const [selectedType, setSelectedType] = useState<InsightType | "ALL">(
    (searchParams.get("type") as InsightType | "ALL") || DEFAULT_FILTERS.type,
  );
  const [county, setCounty] = useState(
    searchParams.get("county") || DEFAULT_FILTERS.county,
  );
  const [bufferMiles, setBufferMiles] = useState(
    Number(searchParams.get("buffer")) || DEFAULT_FILTERS.bufferMiles,
  );
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [status, setStatus] = useState(
    searchParams.get("status") || DEFAULT_FILTERS.status,
  );
  const [appreciationRange, setAppreciationRange] = useState(
    searchParams.get("appreciation") || DEFAULT_FILTERS.appreciationRange,
  );
  const [minCorrelation, setMinCorrelation] = useState(
    searchParams.get("correlation") || DEFAULT_FILTERS.minCorrelation,
  );
  const [yearFrom, setYearFrom] = useState(
    searchParams.get("yearFrom") || DEFAULT_FILTERS.yearFrom,
  );
  const [yearTo, setYearTo] = useState(
    searchParams.get("yearTo") || DEFAULT_FILTERS.yearTo,
  );

  // Comparison mode
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Toggle item for comparison (max 3)
  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 items
      }
      return [...prev, id];
    });
  };

  // Parse appreciation range into min/max
  const appreciationBounds = useMemo(() => {
    if (!appreciationRange) return { min: undefined, max: undefined };
    if (appreciationRange === "0-10") return { min: 0, max: 10 };
    if (appreciationRange === "10-20") return { min: 10, max: 20 };
    if (appreciationRange === "20-50") return { min: 20, max: 50 };
    if (appreciationRange === "50+") return { min: 50, max: undefined };
    return { min: undefined, max: undefined };
  }, [appreciationRange]);

  // Check if any filters are active (different from defaults)
  const hasActiveFilters =
    selectedType !== DEFAULT_FILTERS.type ||
    county !== DEFAULT_FILTERS.county ||
    bufferMiles !== DEFAULT_FILTERS.bufferMiles ||
    searchQuery !== "" ||
    status !== "" ||
    appreciationRange !== "" ||
    minCorrelation !== "" ||
    yearFrom !== "" ||
    yearTo !== "";

  // Check if advanced filters are active
  const hasAdvancedFilters =
    status !== "" ||
    appreciationRange !== "" ||
    minCorrelation !== "" ||
    yearFrom !== "" ||
    yearTo !== "";

  // Reset all filters to defaults
  const clearAllFilters = () => {
    setSelectedType(DEFAULT_FILTERS.type);
    setCounty(DEFAULT_FILTERS.county);
    setBufferMiles(DEFAULT_FILTERS.bufferMiles);
    setSearchQuery("");
    setStatus("");
    setAppreciationRange("");
    setMinCorrelation("");
    setYearFrom("");
    setYearTo("");
  };

  // Generate shareable URL with current filters
  const getShareableUrl = () => {
    const params = new URLSearchParams();
    if (selectedType !== DEFAULT_FILTERS.type) params.set("type", selectedType);
    if (county !== DEFAULT_FILTERS.county) params.set("county", county);
    if (bufferMiles !== DEFAULT_FILTERS.bufferMiles)
      params.set("buffer", String(bufferMiles));
    if (searchQuery) params.set("q", searchQuery);
    if (status) params.set("status", status);
    if (appreciationRange) params.set("appreciation", appreciationRange);
    if (minCorrelation) params.set("correlation", minCorrelation);
    if (yearFrom) params.set("yearFrom", yearFrom);
    if (yearTo) params.set("yearTo", yearTo);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/insights${params.toString() ? `?${params.toString()}` : ""}`;
  };

  // Copy shareable link to clipboard
  const copyShareableLink = async () => {
    const url = getShareableUrl();
    await navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  // Insights query
  const { data: insightsData, isLoading: insightsLoading } =
    trpc.insights.listInsights.useQuery({
      limit: 100,
      types: selectedType !== "ALL" ? [selectedType] : undefined,
      county: county || undefined,
      radiusMiles: bufferMiles,
      search: searchQuery || undefined,
      status: status
        ? (status as "ACTIVE" | "COMPLETED" | "PENDING" | "CANCELLED")
        : undefined,
      minAppreciation: appreciationBounds.min,
      maxAppreciation: appreciationBounds.max,
      minCorrelation: minCorrelation ? Number(minCorrelation) : undefined,
      minYear: yearFrom ? Number(yearFrom) : undefined,
      maxYear: yearTo ? Number(yearTo) : undefined,
    });

  // Growth Opportunities query
  const { data: growthData, isLoading: growthLoading } =
    trpc.insights.getGrowthOpportunities.useQuery(
      {
        county: county,
        limit: 6,
        minConfidence: 30,
      },
      {
        enabled: !!county,
      },
    );

  // Get items selected for comparison
  const comparisonItems = useMemo(() => {
    if (!insightsData?.items) return [];
    return insightsData.items.filter((item) =>
      selectedForCompare.includes(item.id),
    );
  }, [insightsData, selectedForCompare]);

  // Export to CSV function
  const exportToCSV = () => {
    if (!insightsData?.items?.length) return;

    const headers = [
      "Project",
      "Type",
      "Location",
      "Year",
      "Parcels Affected",
      "Value Change %",
      "Lag (years)",
      "Correlation",
    ];
    const rows = insightsData.items.map((item) => [
      item.title,
      item.type.replace(/_/g, " "),
      `${item.city || item.county}, ${item.state}`,
      item.projectYear || "",
      item.parcelsAffected || "",
      item.avgValueChange?.toFixed(1) || "",
      item.lagPeriodYears?.toFixed(1) || "",
      item.correlation?.toFixed(2) || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insights-${county}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate infrastructure analysis metrics
  const analysisMetrics = useMemo(() => {
    if (!insightsData?.items) {
      return {
        projectsAnalyzed: 0,
        avgAppreciation: 0,
        medianLag: 0,
        topSignalType: "Roads",
        topCorrelation: 0,
      };
    }

    const items = insightsData.items;
    const projectsAnalyzed = items.length;

    // Calculate average appreciation
    const appreciations = items
      .filter((i) => i.avgValueChange !== null)
      .map((i) => i.avgValueChange as number);
    const avgAppreciation =
      appreciations.length > 0
        ? appreciations.reduce((a, b) => a + b, 0) / appreciations.length
        : 0;

    // Calculate median lag
    const lags = items
      .filter((i) => i.lagPeriodYears !== null)
      .map((i) => i.lagPeriodYears as number)
      .sort((a, b) => a - b);
    const medianLag =
      lags.length > 0 ? lags[Math.floor(lags.length / 2)] || 0 : 0;

    // Find top signal type by correlation
    const typeCorrelations: Record<string, number[]> = {};
    items.forEach((item) => {
      if (item.correlation !== null) {
        if (!typeCorrelations[item.type]) {
          typeCorrelations[item.type] = [];
        }
        typeCorrelations[item.type]!.push(item.correlation);
      }
    });

    let topSignalType = "Roads";
    let topCorrelation = 0;
    Object.entries(typeCorrelations).forEach(([type, correlations]) => {
      const avg = correlations.reduce((a, b) => a + b, 0) / correlations.length;
      if (avg > topCorrelation) {
        topCorrelation = avg;
        topSignalType =
          type
            .replace(/_/g, " ")
            .replace(/PROJECT|CONSTRUCTION/g, "")
            .trim() || type;
      }
    });

    return {
      projectsAnalyzed,
      avgAppreciation,
      medianLag,
      topSignalType:
        topSignalType.charAt(0).toUpperCase() +
        topSignalType.slice(1).toLowerCase(),
      topCorrelation,
    };
  }, [insightsData]);

  // Growth opportunities count (properties near infrastructure)
  const growthOpportunities = useMemo(() => {
    if (!insightsData?.items) return 0;
    // Sum parcels affected by all projects
    return insightsData.items.reduce(
      (sum, item) => sum + (item.parcelsAffected || 0),
      0,
    );
  }, [insightsData]);

  // Heatmap data
  const insightItems = insightsData?.items;
  const heatmapPoints = useMemo(() => {
    if (!insightItems || !showHeatmap) return [];
    return insightItems
      .filter((i) => i.latitude && i.longitude)
      .map((insight) => ({
        lat: insight.latitude,
        lng: insight.longitude,
        intensity: insight.correlation
          ? Math.min(insight.correlation, 1)
          : insight.estimatedValue
            ? Math.min(Number(insight.estimatedValue) / 1000000000, 1)
            : 0.3,
      }));
  }, [insightItems, showHeatmap]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "MUNICIPAL_BOND":
        return <Landmark className="w-4 h-4" />;
      case "SCHOOL_CONSTRUCTION":
        return <GraduationCap className="w-4 h-4" />;
      case "ROAD_PROJECT":
        return <Route className="w-4 h-4" />;
      case "INFRASTRUCTURE":
        return <Building2 className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "MUNICIPAL_BOND":
        return "#60A5FA";
      case "SCHOOL_CONSTRUCTION":
        return "#34D399";
      case "ROAD_PROJECT":
        return "#FB923C";
      case "INFRASTRUCTURE":
        return "#22D3EE";
      case "ZONING_CHANGE":
        return "#A78BFA";
      case "DEVELOPMENT_PERMIT":
        return "#2DD4BF";
      case "TAX_INCENTIVE":
        return "#FACC15";
      default:
        return "#A3E635";
    }
  };

  // Map markers
  const insightMarkers = useMemo(() => {
    if (!insightItems) return [];
    return insightItems
      .filter(
        (i): i is typeof i & { latitude: number; longitude: number } =>
          i.latitude !== null && i.longitude !== null,
      )
      .map((insight) => ({
        id: insight.id,
        latitude: insight.latitude,
        longitude: insight.longitude,
        color: getMarkerColor(insight.type),
        label: insight.title.substring(0, 20),
        popup: `
          <div class="p-2">
            <h4 class="font-bold">${insight.title}</h4>
            <p class="text-sm">${insight.type.replace(/_/g, " ")}</p>
            ${insight.avgValueChange ? `<p class="text-sm text-green-600">+${insight.avgValueChange.toFixed(1)}% value change</p>` : ""}
          </div>
        `,
      }));
  }, [insightItems]);

  // Generate narrative insights based on data
  const narrativeInsights = useMemo(() => {
    const insights: string[] = [];

    if (analysisMetrics.topCorrelation > 0.5) {
      insights.push(
        `${analysisMetrics.topSignalType} projects show strong correlation (${analysisMetrics.topCorrelation.toFixed(2)}) with property appreciation`,
      );
    }

    if (analysisMetrics.avgAppreciation > 0) {
      insights.push(
        `Average property value increase of ${analysisMetrics.avgAppreciation.toFixed(1)}% within ${analysisMetrics.medianLag.toFixed(1)} years of project completion`,
      );
    }

    if (insightsData?.items) {
      const schoolProjects = insightsData.items.filter(
        (i) => i.type === "SCHOOL_CONSTRUCTION",
      );
      if (schoolProjects.length > 0) {
        const avgSchoolAppreciation =
          schoolProjects
            .filter((s) => s.avgValueChange)
            .reduce((sum, s) => sum + (s.avgValueChange || 0), 0) /
            Math.max(
              schoolProjects.filter((s) => s.avgValueChange).length,
              1,
            ) || 0;
        if (avgSchoolAppreciation > 10) {
          insights.push(
            `School construction correlates with ${avgSchoolAppreciation.toFixed(0)}% faster appreciation in surrounding areas`,
          );
        }
      }

      const waterProjects = insightsData.items.filter(
        (i) => i.type === "INFRASTRUCTURE",
      );
      if (waterProjects.length > 0) {
        insights.push(
          `Water/sewer infrastructure expansions impact ${waterProjects.reduce((sum, w) => sum + (w.parcelsAffected || 0), 0).toLocaleString()} parcels in the area`,
        );
      }
    }

    // Return empty if no data - we don't want to show generic fallbacks
    return insights.slice(0, 4);
  }, [analysisMetrics, insightsData]);

  // Check if we have enough data to show Key Insights section
  const hasRealInsights =
    analysisMetrics.projectsAnalyzed > 0 && narrativeInsights.length > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-white transition-colors flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only md:not-sr-only">Dashboard</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <span className="text-lime-400 font-medium">Market Insights</span>
        {selectedType !== "ALL" && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-gray-300">
              {SIGNAL_TYPES.find((t) => t.value === selectedType)?.label}
            </span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Insights</h1>
          <p className="text-gray-400 mt-1">
            Infrastructure impact analysis for real estate investment
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2.5 w-48 md:w-64 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] text-sm placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* County Selector */}
          <div className="relative">
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              aria-label="Select county"
              className="appearance-none pl-4 pr-10 py-2.5 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] font-mono text-sm"
            >
              {COUNTIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={!insightsData?.items?.length}
            className="p-2.5 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch text-gray-400 hover:text-lime-400 hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          {/* Share Button */}
          <button
            onClick={copyShareableLink}
            className="p-2.5 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch text-gray-400 hover:text-lime-400 hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] transition-colors"
            title="Copy shareable link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {/* Compare Toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`relative p-2.5 clip-notch transition-colors ${
              compareMode
                ? "bg-lime-400/10 text-lime-400 shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.3)]"
                : selectedForCompare.length > 0
                  ? "bg-blue-400/10 text-blue-400 shadow-[inset_0_0_0_1px_theme(colors.blue.400/0.3)]"
                  : "bg-gray-900 text-gray-400 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] hover:text-lime-400 hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
            }`}
            title={
              compareMode
                ? "Exit compare mode"
                : selectedForCompare.length > 0
                  ? `Compare ${selectedForCompare.length} projects`
                  : "Compare projects"
            }
          >
            <GitCompare className="w-4 h-4" />
            {selectedForCompare.length > 0 && !compareMode && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 text-black text-[10px] rounded-full flex items-center justify-center font-mono">
                {selectedForCompare.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Comparison Panel */}
      {compareMode && (
        <div className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4 clip-notch">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-lime-400" />
              <span className="font-mono text-sm uppercase tracking-wider text-gray-400">
                Compare Mode
              </span>
              <span className="text-xs text-gray-500">
                (Select up to 3 projects from the table below)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {selectedForCompare.length}/3 selected
              </span>
              {selectedForCompare.length > 0 && (
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="text-xs text-gray-500 hover:text-white underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {comparisonItems.length >= 2 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-2 px-3 text-left text-xs font-mono uppercase text-gray-500">
                      Metric
                    </th>
                    {comparisonItems.map((item) => (
                      <th
                        key={item.id}
                        className="py-2 px-3 text-left text-xs font-mono uppercase text-gray-400"
                      >
                        {item.title.length > 25
                          ? `${item.title.substring(0, 25)}...`
                          : item.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  <tr>
                    <td className="py-2 px-3 text-gray-500">Type</td>
                    {comparisonItems.map((item) => (
                      <td key={item.id} className="py-2 px-3 text-gray-300">
                        {item.type.replace(/_/g, " ")}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-500">Location</td>
                    {comparisonItems.map((item) => (
                      <td key={item.id} className="py-2 px-3 text-gray-300">
                        {item.city || item.county}, {item.state}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-500">Year</td>
                    {comparisonItems.map((item) => (
                      <td
                        key={item.id}
                        className="py-2 px-3 font-mono text-white"
                      >
                        {item.projectYear || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-500">Value Change</td>
                    {comparisonItems.map((item) => (
                      <td
                        key={item.id}
                        className={`py-2 px-3 font-mono ${
                          item.avgValueChange !== null &&
                          item.avgValueChange > 0
                            ? "text-lime-400"
                            : item.avgValueChange !== null &&
                                item.avgValueChange < 0
                              ? "text-red-400"
                              : "text-gray-500"
                        }`}
                      >
                        {item.avgValueChange !== null
                          ? `${item.avgValueChange > 0 ? "+" : ""}${item.avgValueChange.toFixed(1)}%`
                          : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-500">Parcels</td>
                    {comparisonItems.map((item) => (
                      <td
                        key={item.id}
                        className="py-2 px-3 font-mono text-white"
                      >
                        {item.parcelsAffected?.toLocaleString() || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-500">Lag</td>
                    {comparisonItems.map((item) => (
                      <td
                        key={item.id}
                        className="py-2 px-3 font-mono text-white"
                      >
                        {item.lagPeriodYears !== null
                          ? `${item.lagPeriodYears.toFixed(1)} yrs`
                          : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-500">Correlation</td>
                    {comparisonItems.map((item) => (
                      <td
                        key={item.id}
                        className={`py-2 px-3 font-mono ${
                          item.correlation !== null && item.correlation > 0.5
                            ? "text-lime-400"
                            : item.correlation !== null &&
                                item.correlation > 0.3
                              ? "text-yellow-400"
                              : "text-gray-400"
                        }`}
                      >
                        {item.correlation !== null
                          ? item.correlation.toFixed(2)
                          : "—"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Select at least 2 projects to compare
            </p>
          )}
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className={`flex items-center gap-2 px-4 py-2 text-sm clip-notch transition-colors ${
          hasAdvancedFilters
            ? "bg-lime-400/10 text-lime-400 shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.3)]"
            : "bg-gray-900 text-gray-400 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Advanced Filters
        {hasAdvancedFilters && (
          <span className="px-1.5 py-0.5 bg-lime-400/20 text-lime-400 text-xs rounded-full">
            {
              [
                status,
                appreciationRange,
                minCorrelation,
                yearFrom,
                yearTo,
              ].filter(Boolean).length
            }
          </span>
        )}
        {showAdvancedFilters ? (
          <ChevronUp className="w-4 h-4 ml-auto" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-auto" />
        )}
      </button>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-4 clip-notch">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-gray-800 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white text-sm clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Appreciation Range */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Appreciation
              </label>
              <select
                value={appreciationRange}
                onChange={(e) => setAppreciationRange(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-gray-800 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white text-sm clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
              >
                {APPRECIATION_PRESETS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Correlation Filter */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Min Correlation
              </label>
              <select
                value={minCorrelation}
                onChange={(e) => setMinCorrelation(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-gray-800 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white text-sm clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
              >
                {CORRELATION_PRESETS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year From */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Year From
              </label>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="2020"
                min="2000"
                max="2030"
                className="w-full px-3 py-2 bg-gray-800 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white text-sm clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] placeholder-gray-600"
              />
            </div>

            {/* Year To */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Year To
              </label>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="2025"
                min="2000"
                max="2030"
                className="w-full px-3 py-2 bg-gray-800 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white text-sm clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] placeholder-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Active filters:
          </span>
          {selectedType !== DEFAULT_FILTERS.type && (
            <button
              onClick={() => setSelectedType(DEFAULT_FILTERS.type)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/10 text-lime-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.3)] clip-notch hover:bg-lime-400/20 transition-colors"
            >
              {SIGNAL_TYPES.find((t) => t.value === selectedType)?.label ||
                selectedType}
              <X className="w-3 h-3" />
            </button>
          )}
          {county !== DEFAULT_FILTERS.county && (
            <button
              onClick={() => setCounty(DEFAULT_FILTERS.county)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-400/10 text-blue-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.blue.400/0.3)] clip-notch hover:bg-blue-400/20 transition-colors"
            >
              {county} County
              <X className="w-3 h-3" />
            </button>
          )}
          {bufferMiles !== DEFAULT_FILTERS.bufferMiles && (
            <button
              onClick={() => setBufferMiles(DEFAULT_FILTERS.bufferMiles)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-400/10 text-purple-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.purple.400/0.3)] clip-notch hover:bg-purple-400/20 transition-colors"
            >
              {bufferMiles} mi buffer
              <X className="w-3 h-3" />
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-400/10 text-orange-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.orange.400/0.3)] clip-notch hover:bg-orange-400/20 transition-colors"
            >
              &quot;{searchQuery}&quot;
              <X className="w-3 h-3" />
            </button>
          )}
          {/* Advanced filter chips */}
          {status && (
            <button
              onClick={() => setStatus("")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400/10 text-cyan-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.cyan.400/0.3)] clip-notch hover:bg-cyan-400/20 transition-colors"
            >
              {STATUS_OPTIONS.find((s) => s.value === status)?.label}
              <X className="w-3 h-3" />
            </button>
          )}
          {appreciationRange && (
            <button
              onClick={() => setAppreciationRange("")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/10 text-emerald-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.emerald.400/0.3)] clip-notch hover:bg-emerald-400/20 transition-colors"
            >
              {
                APPRECIATION_PRESETS.find((a) => a.value === appreciationRange)
                  ?.label
              }
              <X className="w-3 h-3" />
            </button>
          )}
          {minCorrelation && (
            <button
              onClick={() => setMinCorrelation("")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 text-yellow-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.yellow.400/0.3)] clip-notch hover:bg-yellow-400/20 transition-colors"
            >
              {
                CORRELATION_PRESETS.find((c) => c.value === minCorrelation)
                  ?.label
              }
              <X className="w-3 h-3" />
            </button>
          )}
          {(yearFrom || yearTo) && (
            <button
              onClick={() => {
                setYearFrom("");
                setYearTo("");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-400/10 text-pink-400 text-sm shadow-[inset_0_0_0_1px_theme(colors.pink.400/0.3)] clip-notch hover:bg-pink-400/20 transition-colors"
            >
              {yearFrom && yearTo
                ? `${yearFrom}-${yearTo}`
                : yearFrom
                  ? `From ${yearFrom}`
                  : `To ${yearTo}`}
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-white underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Parcels Near Infrastructure Section */}
      <div className="relative bg-lime-400/10 shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.3)] clip-notch p-6">
        {/* L-Bracket Corners */}
        <div className="absolute -top-px -left-px w-4 h-4 border-l-2 border-t-2 border-lime-400/50" />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-r-2 border-b-2 border-lime-400/50" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-lime-400/20 clip-notch">
              <Target className="w-8 h-8 text-lime-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">
                {growthOpportunities.toLocaleString()} Parcels Affected
              </h2>
              <p className="text-gray-400">
                Properties within {bufferMiles} miles of{" "}
                {insightsData?.items?.length || 0} infrastructure projects in{" "}
                {county} County
              </p>
            </div>
          </div>
          <button
            onClick={handleViewOnMap}
            className="px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch flex items-center gap-2 hover:bg-lime-300 transition-colors"
          >
            <Map className="w-4 h-4" />
            View {insightsData?.items?.length || 0} Projects on Map
          </button>
        </div>
      </div>

      {/* Infrastructure Impact Overview - Stats Cards */}
      <div className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] p-6 clip-notch">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400">
            Infrastructure Impact Overview
          </h2>
          <button
            className="text-gray-500 hover:text-gray-300 group relative"
            aria-label="What do these metrics mean?"
          >
            <HelpCircle className="w-4 h-4" />
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <p className="font-semibold text-white mb-2">
                Understanding Metrics
              </p>
              <ul className="space-y-1.5">
                <li>
                  <strong>Appreciation:</strong> Average property value increase
                  near projects
                </li>
                <li>
                  <strong>Median Lag:</strong> Time for appreciation to
                  materialize after project completion
                </li>
                <li>
                  <strong>Correlation:</strong> Statistical relationship between
                  infrastructure and value (0-1 scale)
                </li>
              </ul>
            </div>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white font-mono">
              {analysisMetrics.projectsAnalyzed}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              Projects analyzed
            </p>
            <p className="text-xs text-gray-600 hidden md:block">
              Total infrastructure projects in dataset
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-lime-400 font-mono flex items-center gap-1">
              {analysisMetrics.avgAppreciation > 0 ? "+" : ""}
              {analysisMetrics.avgAppreciation.toFixed(1)}%
              {analysisMetrics.avgAppreciation > 0 ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownRight className="w-5 h-5" />
              )}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Avg Appreciation
            </p>
            <p className="text-xs text-gray-600 hidden md:block">
              Property value increase near projects
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white font-mono">
              {analysisMetrics.medianLag.toFixed(1)} yrs
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Median Lag
            </p>
            <p className="text-xs text-gray-600 hidden md:block">
              Time for appreciation to materialize
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-white">
              {analysisMetrics.topSignalType}
            </p>
            <p className="text-sm text-gray-400">
              Top Signal{" "}
              <span className="text-lime-400 font-mono">
                ({analysisMetrics.topCorrelation.toFixed(2)})
              </span>
            </p>
            <p className="text-xs text-gray-600 hidden md:block">
              Strongest infrastructure-value correlation
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights - Narrative Summary (only shown when we have real data) */}
      {hasRealInsights ? (
        <div className="relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch p-6">
          {/* L-Bracket Corners */}
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-lime-400" />
            Key Insights
          </h3>
          <div className="space-y-3">
            <p className="text-gray-300">
              Based on analysis of {analysisMetrics.projectsAnalyzed}{" "}
              infrastructure projects in {county} County:
            </p>
            <ul className="space-y-2">
              {narrativeInsights.map((insight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-300"
                >
                  <span className="text-lime-400 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Data sourced from public infrastructure records, property tax
              assessments, and municipal bond filings (2017-2024)
            </p>
          </div>
        </div>
      ) : !insightsLoading && analysisMetrics.projectsAnalyzed === 0 ? (
        <div className="relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch p-6">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-gray-500" />
            Key Insights
          </h3>
          <p className="text-gray-400">
            No infrastructure projects found for the current filters. Try
            adjusting your search criteria or expanding the buffer radius to see
            insights.
          </p>
        </div>
      ) : null}

      {/* Growth Opportunities Section */}
      <div className="relative bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch p-6">
        {/* L-Bracket Corners */}
        <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
        <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 clip-notch">
              <Sparkles className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Growth Opportunities
              </h3>
              <p className="text-sm text-gray-400">
                Properties with highest projected appreciation based on
                infrastructure signals
              </p>
            </div>
          </div>
          {growthData?.opportunities && growthData.opportunities.length > 0 && (
            <span className="px-3 py-1 bg-lime-400/10 text-lime-400 text-sm font-mono shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.3)] clip-notch">
              {growthData.opportunities.length} properties
            </span>
          )}
        </div>

        {growthLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <GrowthOpportunityCardSkeleton key={i} />
            ))}
          </div>
        ) : growthData?.opportunities && growthData.opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {growthData.opportunities.map((opp) => (
              <GrowthOpportunityCard
                key={opp.property.parcelId}
                property={opp.property}
                currentValue={opp.currentValue}
                projectedValue={opp.projectedValue}
                projectedAppreciation={opp.projectedAppreciation}
                confidence={opp.confidence}
                risk={opp.risk}
                signals={opp.signals}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-gray-600" />
            <p className="mt-4 text-white font-medium">
              No growth opportunities found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              We couldn&apos;t find properties with infrastructure signals in{" "}
              {county} County. Try selecting a different county.
            </p>
          </div>
        )}
      </div>

      {/* Filters Row */}
      <div
        className="flex flex-wrap gap-4 items-center"
        role="group"
        aria-label="Filter options"
      >
        {/* Signal Type Filter */}
        <div className="relative">
          <Layers
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as InsightType | "ALL")
            }
            aria-label="Filter by infrastructure type"
            className="appearance-none pl-10 pr-10 py-2 bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-white clip-notch focus:outline-none focus:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
          >
            {SIGNAL_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Buffer Distance */}
        <div
          className="flex items-center gap-2 text-sm text-gray-400"
          role="group"
          aria-label="Buffer distance selection"
        >
          <span
            id="buffer-label"
            className="flex items-center gap-1 group relative cursor-help"
          >
            Buffer:
            <HelpCircle className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
            <span
              role="tooltip"
              className="absolute left-0 top-full mt-2 w-56 p-2 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20 font-normal"
            >
              Search radius around each infrastructure project. Properties
              within this distance are considered &quot;affected&quot; by the
              project.
            </span>
          </span>
          <div
            className="flex gap-1"
            role="radiogroup"
            aria-labelledby="buffer-label"
          >
            {BUFFER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBufferMiles(opt.value)}
                role="radio"
                aria-checked={bufferMiles === opt.value}
                aria-label={`${opt.value} mile buffer`}
                className={`px-3 py-1.5 text-xs font-mono clip-notch transition-colors ${
                  bufferMiles === opt.value
                    ? "bg-lime-400/20 text-lime-400 shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
                    : "bg-gray-900 text-gray-400 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div
          className="ml-auto flex items-center bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch p-1"
          role="tablist"
          aria-label="View mode"
        >
          <button
            onClick={() => setViewMode("table")}
            role="tab"
            aria-selected={viewMode === "table"}
            aria-controls="insights-content"
            className={`px-3 py-1.5 clip-notch flex items-center gap-2 transition-colors ${
              viewMode === "table"
                ? "bg-gray-800 text-lime-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" aria-hidden="true" />
            Table
          </button>
          <button
            onClick={() => setViewMode("map")}
            role="tab"
            aria-selected={viewMode === "map"}
            aria-controls="insights-content"
            className={`px-3 py-1.5 clip-notch flex items-center gap-2 transition-colors ${
              viewMode === "map"
                ? "bg-gray-800 text-lime-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Map className="w-4 h-4" aria-hidden="true" />
            Map
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch overflow-hidden">
          {insightsLoading ? (
            <div className="divide-y divide-gray-800">
              {/* Skeleton rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-800 clip-notch" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4" />
                      <div className="h-3 bg-gray-800 rounded w-1/2" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-5 bg-gray-800 rounded w-16 ml-auto" />
                      <div className="h-3 bg-gray-800 rounded w-12 ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : insightsData?.items.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Activity className="w-12 h-12 mx-auto text-gray-600" />
              <p className="mt-4 text-white font-medium">
                No infrastructure projects found
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}" in ${county} County`
                  : `No projects match your current filters in ${county} County`}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 text-sm shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-gray-300 clip-notch hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] transition-colors"
                  >
                    Clear search
                  </button>
                )}
                {bufferMiles < 5 && (
                  <button
                    onClick={() => setBufferMiles(5)}
                    className="px-4 py-2 text-sm shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-gray-300 clip-notch hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] transition-colors"
                  >
                    Expand to 5 mi buffer
                  </button>
                )}
                {selectedType !== "ALL" && (
                  <button
                    onClick={() => setSelectedType("ALL")}
                    className="px-4 py-2 text-sm shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-gray-300 clip-notch hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)] transition-colors"
                  >
                    Show all types
                  </button>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 text-sm bg-lime-400/10 text-lime-400 shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.3)] clip-notch hover:bg-lime-400/20 transition-colors"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden divide-y divide-gray-800">
                {insightsData?.items.map((insight) => (
                  <Link
                    key={insight.id}
                    href={`/insights/${insight.id}`}
                    className="block p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-1.5 bg-gray-800 clip-notch text-gray-400 shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {insight.title}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {insight.city || insight.county}, {insight.state}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="px-1.5 py-0.5 bg-gray-800 text-gray-400 border border-gray-700 clip-notch font-mono uppercase">
                              {insight.type
                                .replace(/_/g, " ")
                                .replace(/PROJECT|CONSTRUCTION/g, "")
                                .trim()}
                            </span>
                            {insight.projectYear && (
                              <span className="text-gray-500 font-mono">
                                {insight.projectYear}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        {insight.avgValueChange !== null ? (
                          <span
                            className={`text-lg font-bold font-mono ${
                              insight.avgValueChange > 0
                                ? "text-lime-400"
                                : "text-red-400"
                            }`}
                          >
                            {insight.avgValueChange > 0 ? "+" : ""}
                            {insight.avgValueChange.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-500 text-lg">—</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    {/* Metrics row - shows all critical data on mobile */}
                    <div className="mt-3 pt-3 border-t border-gray-800/50 grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Parcels</p>
                        <p className="font-mono text-white">
                          {insight.parcelsAffected?.toLocaleString() || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Lag</p>
                        <p className="font-mono text-white">
                          {insight.lagPeriodYears !== null
                            ? `${insight.lagPeriodYears.toFixed(1)}y`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Correlation</p>
                        <p
                          className={`font-mono ${
                            insight.correlation !== null &&
                            insight.correlation > 0.5
                              ? "text-lime-400"
                              : insight.correlation !== null &&
                                  insight.correlation > 0.3
                                ? "text-yellow-400"
                                : "text-white"
                          }`}
                        >
                          {insight.correlation !== null
                            ? insight.correlation.toFixed(2)
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Value</p>
                        <p
                          className={`font-mono ${
                            insight.avgValueChange !== null &&
                            insight.avgValueChange > 0
                              ? "text-lime-400"
                              : insight.avgValueChange !== null &&
                                  insight.avgValueChange < 0
                                ? "text-red-400"
                                : "text-white"
                          }`}
                        >
                          {insight.avgValueChange !== null
                            ? `${insight.avgValueChange > 0 ? "+" : ""}${insight.avgValueChange.toFixed(1)}%`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-800/30">
                      {compareMode && (
                        <th className="px-2 py-3 w-10">
                          <span className="sr-only">Compare</span>
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-gray-400">
                        Project
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-gray-400">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-gray-400">
                        Year
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-gray-400">
                        Parcels
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-gray-400">
                        Value Change
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-gray-400 group relative">
                        <button
                          type="button"
                          className="flex items-center justify-end gap-1 w-full focus:outline-none focus:text-lime-400"
                          aria-describedby="lag-tooltip"
                        >
                          Lag
                          <Info className="w-3 h-3 text-gray-600 group-focus-within:text-lime-400" />
                        </button>
                        <span
                          id="lag-tooltip"
                          role="tooltip"
                          className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity whitespace-nowrap z-10"
                        >
                          Time for appreciation to materialize
                        </span>
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-gray-400 group relative">
                        <button
                          type="button"
                          className="flex items-center justify-end gap-1 w-full focus:outline-none focus:text-lime-400"
                          aria-describedby="correlation-tooltip"
                        >
                          Correlation
                          <Info className="w-3 h-3 text-gray-600 group-focus-within:text-lime-400" />
                        </button>
                        <span
                          id="correlation-tooltip"
                          role="tooltip"
                          className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity whitespace-nowrap z-10"
                        >
                          0-1 scale: higher = stronger relationship
                        </span>
                      </th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {insightsData?.items.map((insight) => {
                      const isSelected = selectedForCompare.includes(
                        insight.id,
                      );
                      return (
                        <tr
                          key={insight.id}
                          onClick={() => {
                            if (!compareMode) {
                              router.push(`/insights/${insight.id}`);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !compareMode) {
                              router.push(`/insights/${insight.id}`);
                            }
                          }}
                          tabIndex={0}
                          role={compareMode ? "row" : "link"}
                          aria-label={
                            compareMode
                              ? `Select ${insight.title} for comparison`
                              : `View details for ${insight.title}`
                          }
                          className={`transition-colors focus:outline-none focus:ring-1 focus:ring-lime-400/50 ${
                            compareMode
                              ? isSelected
                                ? "bg-lime-400/10"
                                : "hover:bg-gray-800/30 cursor-pointer"
                              : "hover:bg-gray-800/30 cursor-pointer"
                          }`}
                        >
                          {compareMode && (
                            <td className="px-2 py-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCompare(insight.id);
                                }}
                                className={`w-5 h-5 clip-notch flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-lime-400 shadow-[inset_0_0_0_1px_theme(colors.lime.400)] text-black"
                                    : selectedForCompare.length >= 3
                                      ? "shadow-[inset_0_0_0_1px_theme(colors.gray.700)] text-gray-700 cursor-not-allowed"
                                      : "shadow-[inset_0_0_0_1px_theme(colors.gray.600)] hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400/0.5)]"
                                }`}
                                disabled={
                                  !isSelected && selectedForCompare.length >= 3
                                }
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </button>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-gray-800 clip-notch text-gray-400">
                                {getInsightIcon(insight.type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {insight.title}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {insight.city || insight.county},{" "}
                                  {insight.state}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-mono uppercase tracking-wider bg-gray-800 text-gray-300 shadow-[inset_0_0_0_1px_theme(colors.gray.700)] clip-notch">
                              {insight.type
                                .replace(/_/g, " ")
                                .replace(/PROJECT|CONSTRUCTION/g, "")
                                .trim()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-white">
                            {insight.projectYear || "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-white">
                            {insight.parcelsAffected?.toLocaleString() || "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {insight.avgValueChange !== null ? (
                              <span
                                className={`text-sm font-mono ${
                                  insight.avgValueChange > 0
                                    ? "text-lime-400"
                                    : "text-red-400"
                                }`}
                              >
                                {insight.avgValueChange > 0 ? "+" : ""}
                                {insight.avgValueChange.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-white">
                            {insight.lagPeriodYears !== null
                              ? `${insight.lagPeriodYears.toFixed(1)} yrs`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {insight.correlation !== null ? (
                              <span
                                className={`text-sm font-mono ${
                                  insight.correlation > 0.5
                                    ? "text-lime-400"
                                    : insight.correlation > 0.3
                                      ? "text-yellow-400"
                                      : "text-gray-400"
                                }`}
                              >
                                {insight.correlation.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {/* Table footer */}
          {insightsData?.items && insightsData.items.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
              <span>
                Showing {insightsData.items.length} projects sorted by
                correlation strength
              </span>
              <span className="text-gray-600">
                Click any row to view details
              </span>
            </div>
          )}
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <div
          ref={mapViewRef}
          className="bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)] clip-notch overflow-hidden relative"
        >
          <MapView
            markers={insightMarkers}
            showBaseLayerSwitcher
            style={{ height: 500 }}
            heatmapData={heatmapPoints}
            showHeatmap={showHeatmap}
            heatmapRadius={25}
            heatmapIntensity={1.5}
            heatmapOpacity={0.7}
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              aria-label={
                showHeatmap ? "Hide heatmap overlay" : "Show heatmap overlay"
              }
              aria-pressed={showHeatmap}
              className={`px-3 py-2 text-sm font-mono flex items-center gap-2 clip-notch transition-colors ${
                showHeatmap
                  ? "bg-orange-400 text-black"
                  : "bg-black/70 text-white hover:bg-black/80 shadow-[inset_0_0_0_1px_theme(colors.gray.600)]"
              }`}
            >
              <Flame className="w-4 h-4" aria-hidden="true" />
              Heatmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
