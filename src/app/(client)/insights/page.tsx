"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { trpc } from "@/shared/lib/trpc";
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
  DollarSign,
  Target,
  Map,
  List,
  SlidersHorizontal,
  Navigation,
  ChevronDown,
  Flame,
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
type ViewMode = "list" | "map";
type SortOption = "newest" | "value_desc" | "distance" | "expected_roi";
type InsightType =
  | "MUNICIPAL_BOND"
  | "SCHOOL_CONSTRUCTION"
  | "ROAD_PROJECT"
  | "ZONING_CHANGE"
  | "DEVELOPMENT_PERMIT"
  | "INFRASTRUCTURE"
  | "TAX_INCENTIVE";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "value_desc", label: "Highest Value" },
  { value: "distance", label: "Nearest" },
  { value: "expected_roi", label: "Best ROI" },
];

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("insights");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedTypes, setSelectedTypes] = useState<InsightType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [county, setCounty] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Location filter state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Value filter state
  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
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
        alert("Could not get your location. Please check permissions.");
      },
    );
  };

  // Insights query
  const { data: insightsData, isLoading: insightsLoading } =
    trpc.insights.listInsights.useQuery(
      {
        limit: 50,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        county: county || undefined,
        search: searchQuery || undefined,
        latitude:
          useLocationFilter && userLocation ? userLocation.lat : undefined,
        longitude:
          useLocationFilter && userLocation ? userLocation.lng : undefined,
        radiusMiles: useLocationFilter ? radiusMiles : undefined,
        minValue: minValue ? parseFloat(minValue) : undefined,
        maxValue: maxValue ? parseFloat(maxValue) : undefined,
        sortBy,
      },
      { enabled: activeTab === "insights" },
    );

  // Heatmap data - use insights data for heatmap visualization
  const insightItems = insightsData?.items;
  const heatmapPoints = useMemo(() => {
    if (!insightItems || !showHeatmap) return [];
    return insightItems
      .filter((i) => i.latitude && i.longitude)
      .map((insight) => ({
        lat: insight.latitude,
        lng: insight.longitude,
        intensity: insight.estimatedValue
          ? Math.min(Number(insight.estimatedValue) / 1000000000, 1)
          : 0.3,
      }));
  }, [insightItems, showHeatmap]);

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

  const toggleType = (type: InsightType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

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
        return <Landmark className="w-5 h-5" />;
      case "SCHOOL_CONSTRUCTION":
        return <GraduationCap className="w-5 h-5" />;
      case "ROAD_PROJECT":
        return <Route className="w-5 h-5" />;
      case "INFRASTRUCTURE":
        return <Building2 className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "MUNICIPAL_BOND":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      case "SCHOOL_CONSTRUCTION":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "ROAD_PROJECT":
        return "text-orange-400 bg-orange-400/10 border-orange-400/30";
      case "INFRASTRUCTURE":
        return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
      case "ZONING_CHANGE":
        return "text-purple-400 bg-purple-400/10 border-purple-400/30";
      case "DEVELOPMENT_PERMIT":
        return "text-teal-400 bg-teal-400/10 border-teal-400/30";
      case "TAX_INCENTIVE":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      default:
        return "text-lime-400 bg-lime-400/10 border-lime-400/30";
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

  // Extract items for stable memoization dependencies
  const engineerItems = engineersData?.items;
  const ownerItems = ownersData?.items;

  // Map markers for insights
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
            ${insight.estimatedValue ? `<p class="text-sm text-green-600">$${Number(insight.estimatedValue).toLocaleString()}</p>` : ""}
          </div>
        `,
      }));
  }, [insightItems]);

  // Map markers for engineers
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

  // Map markers for property owners
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Investment Insights
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Discover opportunities from municipal bonds, schools, roads, and
            infrastructure projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-[var(--muted)] rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--card)] text-lime-400"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <List className="w-4 h-4" />
              List
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 text-lime-400 clip-notch-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[var(--muted-foreground)] text-sm">
                Total Insights
              </p>
              <p className="text-xl font-bold text-[var(--foreground)] font-mono">
                {stats?.totalInsights || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-400/10 text-blue-400 clip-notch-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[var(--muted-foreground)] text-sm">
                Est. Total Value
              </p>
              <p className="text-xl font-bold text-[var(--foreground)] font-mono">
                $
                {stats?.totalEstimatedValue
                  ? Number(stats.totalEstimatedValue).toLocaleString()
                  : "0"}
              </p>
            </div>
          </div>
        </div>
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
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Insights
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

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* County */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="County"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-40 pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Sort (insights tab only) */}
          {activeTab === "insights" && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          )}

          {/* Location Filter Button */}
          <button
            onClick={getUserLocation}
            disabled={loadingLocation}
            className={`px-4 py-2 flex items-center gap-2 border clip-notch-sm transition-colors ${
              useLocationFilter
                ? "bg-lime-400/20 text-lime-400 border-lime-400/50"
                : "bg-[var(--input)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-lime-400/50"
            }`}
          >
            {loadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {useLocationFilter ? "Near Me" : "Use Location"}
          </button>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 flex items-center gap-2 border clip-notch-sm transition-colors ${
              showFilters
                ? "bg-lime-400/20 text-lime-400 border-lime-400/50"
                : "bg-[var(--input)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-lime-400/50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Heatmap Toggle (map view only) */}
          {viewMode === "map" && activeTab === "insights" && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 flex items-center gap-2 border clip-notch-sm transition-colors ${
                showHeatmap
                  ? "bg-orange-400/20 text-orange-400 border-orange-400/50"
                  : "bg-[var(--input)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-orange-400/50"
              }`}
            >
              <Flame className="w-4 h-4" />
              Heatmap
            </button>
          )}
        </div>

        {/* Extended Filters Panel */}
        {showFilters && (
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Radius Slider */}
              {useLocationFilter && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Search Radius: {radiusMiles} miles
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(parseInt(e.target.value))}
                    className="w-full accent-lime-400"
                  />
                  <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                    <span>5 mi</span>
                    <span>200 mi</span>
                  </div>
                </div>
              )}

              {/* Value Range (insights tab) */}
              {activeTab === "insights" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Min Value
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <input
                        type="number"
                        placeholder="0"
                        value={minValue}
                        onChange={(e) => setMinValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Max Value
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <input
                        type="number"
                        placeholder="No limit"
                        value={maxValue}
                        onChange={(e) => setMaxValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--input)] border border-[var(--border)] text-[var(--foreground)] clip-notch-sm focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Clear Location Filter */}
            {useLocationFilter && (
              <button
                onClick={() => {
                  setUseLocationFilter(false);
                  setUserLocation(null);
                }}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear location filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Type Filters (for insights tab) */}
      {activeTab === "insights" && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(INSIGHT_TYPES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => toggleType(key as InsightType)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border clip-notch-sm transition-colors ${
                selectedTypes.includes(key as InsightType)
                  ? "bg-lime-400/20 text-lime-400 border-lime-400/50"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--foreground)]"
              }`}
            >
              {value.label}
            </button>
          ))}
        </div>
      )}

      {/* Specialty Filters (for engineers tab) */}
      {activeTab === "engineers" && (
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
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <div className="bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden">
          <MapView
            markers={currentMarkers}
            showBaseLayerSwitcher
            style={{ height: 500 }}
            center={
              userLocation ? [userLocation.lng, userLocation.lat] : undefined
            }
            zoom={userLocation ? 10 : undefined}
          />
          {showHeatmap && heatmapPoints.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-sm">
              <Flame className="w-4 h-4 inline mr-2 text-orange-400" />
              Heatmap: {heatmapPoints.length} data points
            </div>
          )}
        </div>
      )}

      {/* List View Content */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {/* Insights Tab */}
          {activeTab === "insights" && (
            <>
              {insightsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
                </div>
              ) : insightsData?.items.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto text-[var(--muted-foreground)]" />
                  <p className="mt-4 text-[var(--muted-foreground)]">
                    No insights found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insightsData?.items.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-[var(--card)] border border-[var(--border)] p-5 clip-notch hover:border-lime-400/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 clip-notch-sm ${getInsightColor(insight.type)}`}
                        >
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-[var(--foreground)] truncate">
                              {insight.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 text-xs font-mono uppercase tracking-wider border clip-notch-sm shrink-0 ${getInsightColor(insight.type)}`}
                            >
                              {insight.type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
                            {insight.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {insight.city || insight.county}, {insight.state}
                            </span>
                            {insight.estimatedValue && (
                              <span className="flex items-center gap-1 text-lime-400 font-mono">
                                <DollarSign className="w-3 h-3" />
                                {Number(
                                  insight.estimatedValue,
                                ).toLocaleString()}
                              </span>
                            )}
                            {insight.expectedROI && (
                              <span className="flex items-center gap-1 text-green-400 font-mono">
                                <TrendingUp className="w-3 h-3" />
                                {insight.expectedROI}% ROI
                              </span>
                            )}
                            {insight.distance !== null && (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {insight.distance.toFixed(1)} mi
                              </span>
                            )}
                          </div>
                          {insight.sourceUrl && (
                            <a
                              href={insight.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 text-xs text-lime-400 hover:text-lime-300"
                            >
                              View Source <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Property Owners Tab */}
          {activeTab === "owners" && (
            <>
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
                          Assessed: $
                          {Number(owner.assessedValue).toLocaleString()}
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
      )}
    </div>
  );
}
