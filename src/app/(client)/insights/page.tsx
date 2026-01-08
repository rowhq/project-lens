"use client";

import { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import {
  MapPin,
  Target,
  Map,
  List,
  ChevronDown,
  ChevronUp,
  Flame,
  Layers,
  ChevronRight,
  Search,
  X,
  Download,
  HelpCircle,
  Home,
  SlidersHorizontal,
  Share2,
  GitCompare,
  Sparkles,
} from "lucide-react";
import {
  GrowthOpportunityCard,
  GrowthOpportunityCardSkeleton,
} from "@/shared/components/insights";
import {
  ViewMode,
  InsightType,
  InsightItem,
  AnalysisMetrics,
  SIGNAL_TYPES,
  BUFFER_OPTIONS,
  COUNTIES,
  STATUS_OPTIONS,
  APPRECIATION_PRESETS,
  CORRELATION_PRESETS,
  DEFAULT_FILTERS,
  getMarkerColor,
  ComparisonPanel,
  StatsOverview,
  InsightsTable,
} from "./_components";

// Dynamic import for MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/shared/components/common/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-[var(--secondary)] animate-pulse clip-notch" />
    ),
  },
);

export default function InsightsPage() {
  const searchParams = useSearchParams();
  const mapViewRef = useRef<HTMLDivElement>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Filter state from URL params
  const [selectedType, setSelectedType] = useState<InsightType | "ALL">(
    (searchParams.get("type") as InsightType | "ALL") || DEFAULT_FILTERS.type,
  );
  const [county, setCounty] = useState(
    searchParams.get("county") || DEFAULT_FILTERS.county,
  );
  const [bufferMiles, setBufferMiles] = useState(
    Number(searchParams.get("buffer")) || DEFAULT_FILTERS.bufferMiles,
  );
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

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  // Parse appreciation range
  const appreciationBounds = useMemo(() => {
    if (!appreciationRange) return { min: undefined, max: undefined };
    if (appreciationRange === "0-10") return { min: 0, max: 10 };
    if (appreciationRange === "10-20") return { min: 10, max: 20 };
    if (appreciationRange === "20-50") return { min: 20, max: 50 };
    if (appreciationRange === "50+") return { min: 50, max: undefined };
    return { min: undefined, max: undefined };
  }, [appreciationRange]);

  // Check if filters are active
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

  const hasAdvancedFilters =
    status !== "" ||
    appreciationRange !== "" ||
    minCorrelation !== "" ||
    yearFrom !== "" ||
    yearTo !== "";

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

  const copyShareableLink = async () => {
    await navigator.clipboard.writeText(getShareableUrl());
  };

  // Data queries
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

  const { data: growthData, isLoading: growthLoading } =
    trpc.insights.getGrowthOpportunities.useQuery(
      { county, limit: 6, minConfidence: 30 },
      { enabled: !!county },
    );

  // Memoized values
  const comparisonItems = useMemo(() => {
    if (!insightsData?.items) return [];
    return insightsData.items.filter((item) =>
      selectedForCompare.includes(item.id),
    ) as InsightItem[];
  }, [insightsData, selectedForCompare]);

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

  const analysisMetrics: AnalysisMetrics = useMemo(() => {
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
    const appreciations = items
      .filter((i) => i.avgValueChange !== null)
      .map((i) => i.avgValueChange as number);
    const avgAppreciation =
      appreciations.length > 0
        ? appreciations.reduce((a, b) => a + b, 0) / appreciations.length
        : 0;
    const lags = items
      .filter((i) => i.lagPeriodYears !== null)
      .map((i) => i.lagPeriodYears as number)
      .sort((a, b) => a - b);
    const medianLag =
      lags.length > 0 ? lags[Math.floor(lags.length / 2)] || 0 : 0;
    const typeCorrelations: Record<string, number[]> = {};
    items.forEach((item) => {
      if (item.correlation !== null) {
        if (!typeCorrelations[item.type]) typeCorrelations[item.type] = [];
        typeCorrelations[item.type]!.push(item.correlation);
      }
    });
    let topSignalType = "Roads";
    let topCorrelation = 0;
    Object.entries(typeCorrelations).forEach(([type, correlations]) => {
      const avg = correlations.reduce((a, b) => a + b, 0) / correlations.length;
      if (avg > topCorrelation) {
        topCorrelation = avg;
        topSignalType = type.replace(/_/g, " ").toLowerCase();
      }
    });
    return {
      projectsAnalyzed,
      avgAppreciation,
      medianLag,
      topSignalType:
        topSignalType.charAt(0).toUpperCase() + topSignalType.slice(1),
      topCorrelation,
    };
  }, [insightsData]);

  const growthOpportunities = useMemo(() => {
    if (!insightsData?.items) return 0;
    return insightsData.items.reduce(
      (sum, item) => sum + (item.parcelsAffected || 0),
      0,
    );
  }, [insightsData]);

  const heatmapPoints = useMemo(() => {
    if (!insightsData?.items || !showHeatmap) return [];
    return insightsData.items
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
  }, [insightsData, showHeatmap]);

  const insightMarkers = useMemo(() => {
    if (!insightsData?.items) return [];
    return insightsData.items
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
  }, [insightsData]);

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
    return insights.slice(0, 4);
  }, [analysisMetrics, insightsData]);

  const handleViewOnMap = () => {
    setViewMode("map");
    setTimeout(() => {
      mapViewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-[var(--muted-foreground)] hover:text-white transition-colors flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only md:not-sr-only">Dashboard</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
        <span className="text-lime-400 font-medium">Market Insights</span>
        {selectedType !== "ALL" && (
          <>
            <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="text-[var(--foreground)]">
              {SIGNAL_TYPES.find((t) => t.value === selectedType)?.label}
            </span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Insights</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Infrastructure impact analysis for real estate investment
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2.5 w-48 md:w-64 bg-[var(--card)] border border-[var(--border)] text-white clip-notch focus:outline-none focus:border-lime-400/50 text-sm placeholder-[var(--muted-foreground)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-white"
                aria-label="Clear search"
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
              className="appearance-none pl-4 pr-10 py-2.5 bg-[var(--card)] border border-[var(--border)] text-white clip-notch focus:outline-none focus:border-lime-400/50 font-mono text-sm"
            >
              {COUNTIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
          </div>
          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={!insightsData?.items?.length}
            className="p-2.5 bg-[var(--card)] border border-[var(--border)] clip-notch text-[var(--muted-foreground)] hover:text-lime-400 hover:border-lime-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to CSV"
            aria-label="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          {/* Share Button */}
          <button
            onClick={copyShareableLink}
            className="p-2.5 bg-[var(--card)] border border-[var(--border)] clip-notch text-[var(--muted-foreground)] hover:text-lime-400 hover:border-lime-400/50 transition-colors"
            title="Copy shareable link"
            aria-label="Copy shareable link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {/* Compare Toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`relative p-2.5 border clip-notch transition-colors ${
              compareMode
                ? "bg-lime-400/10 text-lime-400 border-lime-400/30"
                : selectedForCompare.length > 0
                  ? "bg-blue-400/10 text-blue-400 border-blue-400/30"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:text-lime-400 hover:border-lime-400/50"
            }`}
            title={
              compareMode
                ? "Exit compare mode"
                : selectedForCompare.length > 0
                  ? `Compare ${selectedForCompare.length} projects`
                  : "Compare projects"
            }
            aria-label={compareMode ? "Exit compare mode" : "Compare projects"}
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
        <ComparisonPanel
          comparisonItems={comparisonItems}
          selectedForCompare={selectedForCompare}
          onClearSelection={() => setSelectedForCompare([])}
        />
      )}

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className={`flex items-center gap-2 px-4 py-2 text-sm border clip-notch transition-colors ${
          hasAdvancedFilters
            ? "bg-lime-400/10 text-lime-400 border-lime-400/30"
            : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-lime-400/50"
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
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] text-white text-sm clip-notch focus:outline-none focus:border-lime-400/50"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Appreciation
              </label>
              <select
                value={appreciationRange}
                onChange={(e) => setAppreciationRange(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] text-white text-sm clip-notch focus:outline-none focus:border-lime-400/50"
              >
                {APPRECIATION_PRESETS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Min Correlation
              </label>
              <select
                value={minCorrelation}
                onChange={(e) => setMinCorrelation(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] text-white text-sm clip-notch focus:outline-none focus:border-lime-400/50"
              >
                {CORRELATION_PRESETS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Year From
              </label>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="2020"
                min="2000"
                max="2030"
                className="w-full px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] text-white text-sm clip-notch focus:outline-none focus:border-lime-400/50 placeholder-[var(--muted-foreground)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                Year To
              </label>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="2025"
                min="2000"
                max="2030"
                className="w-full px-3 py-2 bg-[var(--secondary)] border border-[var(--border)] text-white text-sm clip-notch focus:outline-none focus:border-lime-400/50 placeholder-[var(--muted-foreground)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
            Active filters:
          </span>
          {selectedType !== DEFAULT_FILTERS.type && (
            <button
              onClick={() => setSelectedType(DEFAULT_FILTERS.type)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/10 text-lime-400 text-sm border border-lime-400/30 clip-notch hover:bg-lime-400/20 transition-colors"
            >
              {SIGNAL_TYPES.find((t) => t.value === selectedType)?.label ||
                selectedType}
              <X className="w-3 h-3" />
            </button>
          )}
          {county !== DEFAULT_FILTERS.county && (
            <button
              onClick={() => setCounty(DEFAULT_FILTERS.county)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-400/10 text-blue-400 text-sm border border-blue-400/30 clip-notch hover:bg-blue-400/20 transition-colors"
            >
              {county} County
              <X className="w-3 h-3" />
            </button>
          )}
          {bufferMiles !== DEFAULT_FILTERS.bufferMiles && (
            <button
              onClick={() => setBufferMiles(DEFAULT_FILTERS.bufferMiles)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-400/10 text-purple-400 text-sm border border-purple-400/30 clip-notch hover:bg-purple-400/20 transition-colors"
            >
              {bufferMiles} mi buffer
              <X className="w-3 h-3" />
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-400/10 text-orange-400 text-sm border border-orange-400/30 clip-notch hover:bg-orange-400/20 transition-colors"
            >
              &quot;{searchQuery}&quot;
              <X className="w-3 h-3" />
            </button>
          )}
          {status && (
            <button
              onClick={() => setStatus("")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-400/10 text-cyan-400 text-sm border border-cyan-400/30 clip-notch hover:bg-cyan-400/20 transition-colors"
            >
              {STATUS_OPTIONS.find((s) => s.value === status)?.label}
              <X className="w-3 h-3" />
            </button>
          )}
          {appreciationRange && (
            <button
              onClick={() => setAppreciationRange("")}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-400/10 text-emerald-400 text-sm border border-emerald-400/30 clip-notch hover:bg-emerald-400/20 transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 text-yellow-400 text-sm border border-yellow-400/30 clip-notch hover:bg-yellow-400/20 transition-colors"
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
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-400/10 text-pink-400 text-sm border border-pink-400/30 clip-notch hover:bg-pink-400/20 transition-colors"
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
            className="text-xs text-[var(--muted-foreground)] hover:text-white underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Parcels Near Infrastructure Section */}
      <div className="relative bg-lime-400/10 border border-lime-400/30 clip-notch p-6">
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
              <p className="text-[var(--muted-foreground)]">
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

      {/* Stats Overview */}
      <StatsOverview
        metrics={analysisMetrics}
        county={county}
        narrativeInsights={narrativeInsights}
        isLoading={insightsLoading}
      />

      {/* Growth Opportunities Section */}
      <div className="relative bg-[var(--card)] border border-[var(--border)] clip-notch p-6">
        <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-[var(--border)]" />
        <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-[var(--border)]" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 clip-notch">
              <Sparkles className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Growth Opportunities
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Properties with highest projected appreciation based on
                infrastructure signals
              </p>
            </div>
          </div>
          {growthData?.opportunities && growthData.opportunities.length > 0 && (
            <span className="px-3 py-1 bg-lime-400/10 text-lime-400 text-sm font-mono border border-lime-400/30 clip-notch">
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
            <Sparkles className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" />
            <p className="mt-4 text-white font-medium">
              No growth opportunities found
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
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
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as InsightType | "ALL")
            }
            aria-label="Filter by infrastructure type"
            className="appearance-none pl-10 pr-10 py-2 bg-[var(--card)] border border-[var(--border)] text-white clip-notch focus:outline-none focus:border-lime-400/50"
          >
            {SIGNAL_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Buffer Distance */}
        <div
          className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]"
          role="group"
          aria-label="Buffer distance selection"
        >
          <span
            id="buffer-label"
            className="flex items-center gap-1 group relative cursor-help"
          >
            Buffer:
            <HelpCircle className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span
              role="tooltip"
              className="absolute left-0 top-full mt-2 w-56 p-2 bg-[var(--secondary)] border border-[var(--border)] rounded text-xs text-[var(--foreground)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20 font-normal"
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
                className={`px-3 py-1.5 text-xs font-mono border clip-notch transition-colors ${
                  bufferMiles === opt.value
                    ? "bg-lime-400/20 text-lime-400 border-lime-400/50"
                    : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-lime-400/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div
          className="ml-auto flex items-center bg-[var(--card)] border border-[var(--border)] clip-notch p-1"
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
                ? "bg-[var(--secondary)] text-lime-400"
                : "text-[var(--muted-foreground)] hover:text-white"
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
                ? "bg-[var(--secondary)] text-lime-400"
                : "text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            <Map className="w-4 h-4" aria-hidden="true" />
            Map
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden">
          <InsightsTable
            items={insightsData?.items as InsightItem[] | undefined}
            isLoading={insightsLoading}
            searchQuery={searchQuery}
            county={county}
            bufferMiles={bufferMiles}
            selectedType={selectedType}
            hasActiveFilters={hasActiveFilters}
            compareMode={compareMode}
            selectedForCompare={selectedForCompare}
            onClearSearch={() => setSearchQuery("")}
            onExpandBuffer={() => setBufferMiles(5)}
            onShowAllTypes={() => setSelectedType("ALL")}
            onClearAllFilters={clearAllFilters}
            onToggleCompare={toggleCompare}
          />
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <div
          ref={mapViewRef}
          className="bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden relative"
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
                  : "bg-black/70 text-white hover:bg-black/80 border border-[var(--border)]"
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
