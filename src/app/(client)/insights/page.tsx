"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  MapPin,
  TrendingUp,
  Building2,
  GraduationCap,
  Route,
  Landmark,
  Users,
  Wrench,
  Search,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  Loader2,
  Target,
  Map,
  List,
  SlidersHorizontal,
  Navigation,
  ChevronDown,
  Flame,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Play,
} from "lucide-react";
import { INSIGHT_TYPES, ENGINEER_SPECIALTIES } from "@/shared/config/constants";

// Dynamic import for MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/shared/components/common/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-gray-800 animate-pulse rounded-lg" />
    ),
  },
);

type TabType = "insights" | "owners" | "engineers";
type ViewMode = "list" | "map" | "table";
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
  { value: 1, label: "1 mile" },
  { value: 2, label: "2 miles" },
  { value: 3, label: "3 miles" },
  { value: 5, label: "5 miles" },
];

export default function InsightsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("insights");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedType, setSelectedType] = useState<InsightType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [county, setCounty] = useState("Harris");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [bufferMiles, setBufferMiles] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Location filter state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUseLocationFilter(true);
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoadingLocation(false);
        toast({
          title: "Error",
          description: "Could not get your location. Please check permissions.",
          variant: "destructive",
        });
      },
    );
  };

  // Insights query
  const { data: insightsData, isLoading: insightsLoading } =
    trpc.insights.listInsights.useQuery(
      {
        limit: 100,
        types: selectedType !== "ALL" ? [selectedType] : undefined,
        county: county || undefined,
        search: searchQuery || undefined,
        latitude:
          useLocationFilter && userLocation ? userLocation.lat : undefined,
        longitude:
          useLocationFilter && userLocation ? userLocation.lng : undefined,
        radiusMiles: useLocationFilter ? radiusMiles : bufferMiles,
      },
      { enabled: activeTab === "insights" },
    );

  // Stats query
  const { data: stats } = trpc.insights.getStats.useQuery({
    county: county || undefined,
  });

  // Owners query
  const { data: ownersData, isLoading: ownersLoading } =
    trpc.insights.searchOwners.useQuery(
      {
        limit: 20,
        county: county || undefined,
        search: searchQuery || undefined,
        latitude:
          useLocationFilter && userLocation ? userLocation.lat : undefined,
        longitude:
          useLocationFilter && userLocation ? userLocation.lng : undefined,
        radiusMiles: useLocationFilter ? radiusMiles : undefined,
      },
      { enabled: activeTab === "owners" },
    );

  // Engineers query
  const { data: engineersData, isLoading: engineersLoading } =
    trpc.insights.searchEngineers.useQuery(
      {
        limit: 20,
        county: county || undefined,
        search: searchQuery || undefined,
        specialties:
          selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
        latitude:
          useLocationFilter && userLocation ? userLocation.lat : undefined,
        longitude:
          useLocationFilter && userLocation ? userLocation.lng : undefined,
        radiusMiles: useLocationFilter ? radiusMiles : undefined,
      },
      { enabled: activeTab === "engineers" },
    );

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
  }, [insightsData?.items]);

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

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty],
    );
  };

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
  const engineerItems = engineersData?.items;
  const ownerItems = ownersData?.items;

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

  const engineerMarkers = useMemo(() => {
    if (!engineerItems) return [];
    return engineerItems
      .filter(
        (e): e is typeof e & { latitude: number; longitude: number } =>
          e.latitude !== null && e.longitude !== null,
      )
      .map((engineer) => ({
        id: engineer.id,
        latitude: engineer.latitude,
        longitude: engineer.longitude,
        color: "#FB923C",
        label: engineer.companyName.substring(0, 15),
        popup: `
          <div class="p-2">
            <h4 class="font-bold">${engineer.companyName}</h4>
            <p class="text-sm">${engineer.specialties.join(", ")}</p>
            <p class="text-sm">${engineer.phone}</p>
          </div>
        `,
      }));
  }, [engineerItems]);

  const ownerMarkers = useMemo(() => {
    if (!ownerItems) return [];
    return ownerItems
      .filter(
        (o): o is typeof o & { latitude: number; longitude: number } =>
          o.latitude !== null && o.longitude !== null,
      )
      .map((owner) => ({
        id: owner.id,
        latitude: owner.latitude,
        longitude: owner.longitude,
        color: "#A78BFA",
        label: owner.ownerName.substring(0, 15),
        popup: `
          <div class="p-2">
            <h4 class="font-bold">${owner.ownerName}</h4>
            <p class="text-sm">${owner.addressLine1}</p>
            ${owner.assessedValue ? `<p class="text-sm text-green-600">$${Number(owner.assessedValue).toLocaleString()}</p>` : ""}
          </div>
        `,
      }));
  }, [ownerItems]);

  const currentMarkers = useMemo(() => {
    if (activeTab === "insights") return insightMarkers;
    if (activeTab === "engineers") return engineerMarkers;
    if (activeTab === "owners") return ownerMarkers;
    return [];
  }, [activeTab, insightMarkers, engineerMarkers, ownerMarkers]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header - Russell Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Market Insights
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Infrastructure impact analysis and growth opportunity identification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch flex items-center gap-2 hover:bg-lime-300 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Analysis
          </button>
          <div className="relative">
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] clip-notch-sm focus:outline-none focus:border-lime-400 font-mono text-sm"
            >
              <option value="Harris">Harris County, TX</option>
              <option value="Dallas">Dallas County, TX</option>
              <option value="Travis">Travis County, TX</option>
              <option value="Bexar">Bexar County, TX</option>
              <option value="Tarrant">Tarrant County, TX</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "insights"
              ? "text-lime-400 border-lime-400"
              : "text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)]"
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Infrastructure Analysis
        </button>
        <button
          onClick={() => setActiveTab("owners")}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "owners"
              ? "text-lime-400 border-lime-400"
              : "text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)]"
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Property Owners
        </button>
        <button
          onClick={() => setActiveTab("engineers")}
          className={`px-4 py-3 font-mono text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "engineers"
              ? "text-lime-400 border-lime-400"
              : "text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)]"
          }`}
        >
          <Wrench className="w-4 h-4 inline mr-2" />
          Engineers
        </button>
      </div>

      {/* Insights Tab - Russell Style */}
      {activeTab === "insights" && (
        <>
          {/* Infrastructure Impact Overview - Summary Cards */}
          <div className="bg-[var(--card)] border border-[var(--border)] p-6 clip-notch">
            <h2 className="font-mono text-sm uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
              Infrastructure Impact Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-3xl font-bold text-[var(--foreground)] font-mono">
                  {analysisMetrics.projectsAnalyzed}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Projects analyzed
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-lime-400 font-mono flex items-center gap-1">
                  {analysisMetrics.avgAppreciation > 0 ? "+" : ""}
                  {analysisMetrics.avgAppreciation.toFixed(1)}%
                  {analysisMetrics.avgAppreciation > 0 ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Avg Appreciation
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[var(--foreground)] font-mono">
                  {analysisMetrics.medianLag.toFixed(1)} yrs
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Median Lag
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {analysisMetrics.topSignalType}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Top Signal Type{" "}
                  <span className="text-lime-400">
                    (Correlation: {analysisMetrics.topCorrelation.toFixed(2)})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Signal Type Filter */}
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as InsightType | "ALL")
                }
                className="appearance-none pl-10 pr-10 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
              >
                {SIGNAL_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
            </div>

            {/* Buffer Distance */}
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span>Buffer Distance:</span>
              <div className="flex gap-1">
                {BUFFER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBufferMiles(opt.value)}
                    className={`px-3 py-1 text-xs font-mono border clip-notch-sm transition-colors ${
                      bufferMiles === opt.value
                        ? "bg-lime-400/20 text-lime-400 border-lime-400/50"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-lime-400/50"
                    }`}
                  >
                    {opt.value} mi
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="ml-auto flex items-center bg-[var(--muted)] rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === "table"
                    ? "bg-[var(--card)] text-lime-400"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <List className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                  viewMode === "map"
                    ? "bg-[var(--card)] text-lime-400"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden">
              {insightsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
                </div>
              ) : insightsData?.items.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" />
                  <p className="mt-4 text-[var(--foreground)] font-medium">
                    No growth opportunities identified for {county} County
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Try selecting a different county or adjusting filters
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                          Project
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                          Year
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                          Parcels
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                          Avg Value Δ
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                          Lag Period
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                          Correlation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {insightsData?.items.map((insight) => (
                        <tr
                          key={insight.id}
                          className="hover:bg-[var(--muted)]/20 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-[var(--muted)] clip-notch-sm">
                                {getInsightIcon(insight.type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                  {insight.title}
                                </p>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                  {insight.city || insight.county},{" "}
                                  {insight.state}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-mono uppercase tracking-wider bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] clip-notch-sm">
                              {insight.type
                                .replace(/_/g, " ")
                                .replace(/PROJECT|CONSTRUCTION/g, "")
                                .trim()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-[var(--foreground)]">
                            {insight.projectYear || "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-[var(--foreground)]">
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
                              <span className="text-sm text-[var(--muted-foreground)]">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-[var(--foreground)]">
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
                                      : "text-[var(--muted-foreground)]"
                                }`}
                              >
                                {insight.correlation.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm text-[var(--muted-foreground)]">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Table footer */}
              <div className="px-4 py-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                Showing {insightsData?.items.length || 0} projects sorted by
                correlation strength
              </div>
            </div>
          )}

          {/* Map View */}
          {viewMode === "map" && (
            <div className="bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden relative">
              <MapView
                markers={currentMarkers}
                showBaseLayerSwitcher
                style={{ height: 500 }}
                center={
                  userLocation
                    ? [userLocation.lng, userLocation.lat]
                    : undefined
                }
                zoom={userLocation ? 10 : undefined}
                heatmapData={heatmapPoints}
                showHeatmap={showHeatmap}
                heatmapRadius={25}
                heatmapIntensity={1.5}
                heatmapOpacity={0.7}
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`px-3 py-2 text-sm font-mono flex items-center gap-2 clip-notch-sm transition-colors ${
                    showHeatmap
                      ? "bg-orange-400/90 text-black"
                      : "bg-black/70 text-white hover:bg-black/80"
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  Heatmap
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Property Owners Tab */}
      {activeTab === "owners" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-400/10 text-purple-400 clip-notch-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    Property Owners
                  </p>
                  <p className="text-xl font-bold text-[var(--foreground)] font-mono">
                    {stats?.totalPropertyOwners || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search property owners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* List */}
          {ownersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
            </div>
          ) : ownersData?.items.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" />
              <p className="mt-4 text-[var(--muted-foreground)]">
                No property owners found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownersData?.items.map((owner) => (
                <div
                  key={owner.id}
                  className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch hover:border-lime-400/50 transition-colors"
                >
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {owner.ownerName}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {owner.addressLine1}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {owner.city}, {owner.state} {owner.zipCode}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] clip-notch-sm">
                      {owner.ownerType}
                    </span>
                    {owner.zoning && (
                      <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-purple-400/10 text-purple-400 border border-purple-400/30 clip-notch-sm">
                        {owner.zoning}
                      </span>
                    )}
                  </div>
                  {owner.assessedValue && (
                    <p className="text-sm text-lime-400 font-mono mt-3">
                      Assessed: ${Number(owner.assessedValue).toLocaleString()}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                    {owner.phone && (
                      <a
                        href={`tel:${owner.phone}`}
                        className="flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                    {owner.email && (
                      <a
                        href={`mailto:${owner.email}`}
                        className="flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Engineers Tab */}
      {activeTab === "engineers" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-400/10 text-orange-400 clip-notch-sm">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[var(--muted-foreground)] text-sm">
                    Engineers
                  </p>
                  <p className="text-xl font-bold text-[var(--foreground)] font-mono">
                    {stats?.totalEngineers || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search engineers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          {/* Specialty Filters */}
          <div className="flex flex-wrap gap-2">
            {ENGINEER_SPECIALTIES.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => toggleSpecialty(specialty.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border clip-notch-sm transition-colors ${
                  selectedSpecialties.includes(specialty.id)
                    ? "bg-lime-400/20 text-lime-400 border-lime-400/50"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--foreground)]"
                }`}
              >
                {specialty.label}
              </button>
            ))}
          </div>

          {/* List */}
          {engineersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
            </div>
          ) : engineersData?.items.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" />
              <p className="mt-4 text-[var(--muted-foreground)]">
                No engineers found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {engineersData?.items.map((engineer) => (
                <div
                  key={engineer.id}
                  className="bg-[var(--card)] border border-[var(--border)] p-5 clip-notch hover:border-lime-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {engineer.companyName}
                        </h3>
                        {engineer.isVerified && (
                          <CheckCircle className="w-4 h-4 text-lime-400" />
                        )}
                      </div>
                      {engineer.contactName && (
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {engineer.contactName}
                        </p>
                      )}
                    </div>
                    {engineer.rating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-mono text-sm">
                          {engineer.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    {engineer.city}, {engineer.county}, {engineer.state}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {engineer.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider bg-orange-400/10 text-orange-400 border border-orange-400/30 clip-notch-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--border)]">
                    <a
                      href={`tel:${engineer.phone}`}
                      className="flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300"
                    >
                      <Phone className="w-3 h-3" />
                      {engineer.phone}
                    </a>
                    {engineer.email && (
                      <a
                        href={`mailto:${engineer.email}`}
                        className="flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    )}
                    {engineer.website && (
                      <a
                        href={engineer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300"
                      >
                        <Globe className="w-3 h-3" />
                        Website
                      </a>
                    )}
                  </div>

                  {engineer.distance !== null && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      <Target className="w-3 h-3 inline mr-1" />
                      {engineer.distance.toFixed(1)} miles away
                      {engineer.serviceRadiusMiles &&
                        ` (serves ${engineer.serviceRadiusMiles} mi radius)`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
