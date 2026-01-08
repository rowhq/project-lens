"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  Building2,
  GraduationCap,
  Route,
  ChevronRight,
  Search,
  ArrowUpRight,
  Home,
  SlidersHorizontal,
  X,
} from "lucide-react";

// Mock data for opportunity areas - in real app this comes from API
const OPPORTUNITY_AREAS = [
  {
    id: "north-austin-183",
    name: "North Austin - Highway 183 Zone",
    description: "Properties near Highway 183 expansion project",
    signal: "ROAD_PROJECT",
    signalName: "Highway 183 Expansion",
    status: "Under Construction",
    projectedAppreciation: 18,
    parcelsInZone: 2847,
    avgPropertyValue: 425000,
    completionYear: 2026,
    county: "Travis",
    city: "Austin",
  },
  {
    id: "round-rock-school",
    name: "Round Rock - New Elementary Zone",
    description: "Properties within 2 miles of new elementary school",
    signal: "SCHOOL_CONSTRUCTION",
    signalName: "Bluebonnet Elementary",
    status: "Approved",
    projectedAppreciation: 12,
    parcelsInZone: 1523,
    avgPropertyValue: 385000,
    completionYear: 2025,
    county: "Williamson",
    city: "Round Rock",
  },
  {
    id: "san-marcos-utility",
    name: "San Marcos - Utility Expansion",
    description: "Previously unserviced land now with water/sewer access",
    signal: "INFRASTRUCTURE",
    signalName: "Water District Expansion",
    status: "Completed",
    projectedAppreciation: 35,
    parcelsInZone: 892,
    avgPropertyValue: 215000,
    completionYear: 2024,
    county: "Hays",
    city: "San Marcos",
  },
  {
    id: "cedar-park-zoning",
    name: "Cedar Park - Mixed Use Rezoning",
    description: "Residential areas rezoned for mixed commercial/residential",
    signal: "ZONING_CHANGE",
    signalName: "Town Center Rezoning",
    status: "Approved",
    projectedAppreciation: 22,
    parcelsInZone: 634,
    avgPropertyValue: 520000,
    completionYear: 2025,
    county: "Williamson",
    city: "Cedar Park",
  },
  {
    id: "pflugerville-toll",
    name: "Pflugerville - Toll Road Access",
    description: "Properties near new toll road interchange",
    signal: "ROAD_PROJECT",
    signalName: "SH 130 Interchange",
    status: "Under Construction",
    projectedAppreciation: 15,
    parcelsInZone: 1876,
    avgPropertyValue: 345000,
    completionYear: 2025,
    county: "Travis",
    city: "Pflugerville",
  },
  {
    id: "kyle-school",
    name: "Kyle - High School District",
    description: "New high school serving growing community",
    signal: "SCHOOL_CONSTRUCTION",
    signalName: "Kyle High School #2",
    status: "Under Construction",
    projectedAppreciation: 14,
    parcelsInZone: 2134,
    avgPropertyValue: 295000,
    completionYear: 2026,
    county: "Hays",
    city: "Kyle",
  },
];

const SIGNAL_ICONS: Record<string, React.ElementType> = {
  ROAD_PROJECT: Route,
  SCHOOL_CONSTRUCTION: GraduationCap,
  INFRASTRUCTURE: Building2,
  ZONING_CHANGE: MapPin,
};

const SIGNAL_COLORS: Record<string, string> = {
  ROAD_PROJECT: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  SCHOOL_CONSTRUCTION:
    "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  INFRASTRUCTURE: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  ZONING_CHANGE: "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

const FILTER_OPTIONS = {
  signal: [
    { value: "", label: "All Types" },
    { value: "ROAD_PROJECT", label: "Roads & Transit" },
    { value: "SCHOOL_CONSTRUCTION", label: "Schools" },
    { value: "INFRASTRUCTURE", label: "Utilities" },
    { value: "ZONING_CHANGE", label: "Zoning Changes" },
  ],
  county: [
    { value: "", label: "All Counties" },
    { value: "Travis", label: "Travis County" },
    { value: "Williamson", label: "Williamson County" },
    { value: "Hays", label: "Hays County" },
  ],
  appreciation: [
    { value: "", label: "Any Appreciation" },
    { value: "10", label: "10%+" },
    { value: "15", label: "15%+" },
    { value: "20", label: "20%+" },
  ],
};

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [signalFilter, setSignalFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");
  const [appreciationFilter, setAppreciationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter areas
  const filteredAreas = OPPORTUNITY_AREAS.filter((area) => {
    if (
      searchQuery &&
      !area.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !area.city.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (signalFilter && area.signal !== signalFilter) return false;
    if (countyFilter && area.county !== countyFilter) return false;
    if (
      appreciationFilter &&
      area.projectedAppreciation < Number(appreciationFilter)
    )
      return false;
    return true;
  });

  const hasActiveFilters = signalFilter || countyFilter || appreciationFilter;

  const clearFilters = () => {
    setSignalFilter("");
    setCountyFilter("");
    setAppreciationFilter("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-white flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only md:not-sr-only">Dashboard</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <span className="text-lime-400">Opportunity Areas</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Opportunity Areas</h1>
          <p className="text-gray-400 mt-1">
            Geographic zones with infrastructure signals that historically drive
            property appreciation
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search areas or cities..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-lime-400/50 text-sm placeholder-gray-500"
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

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
            hasActiveFilters
              ? "bg-lime-400/10 text-lime-400 border-lime-400/30"
              : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-600"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-lime-400/20 text-lime-400 text-xs rounded-full">
              {
                [signalFilter, countyFilter, appreciationFilter].filter(Boolean)
                  .length
              }
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Infrastructure Type
              </label>
              <select
                value={signalFilter}
                onChange={(e) => setSignalFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-lime-400/50"
              >
                {FILTER_OPTIONS.signal.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                County
              </label>
              <select
                value={countyFilter}
                onChange={(e) => setCountyFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-lime-400/50"
              >
                {FILTER_OPTIONS.county.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Min. Appreciation
              </label>
              <select
                value={appreciationFilter}
                onChange={(e) => setAppreciationFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-lime-400/50"
              >
                {FILTER_OPTIONS.appreciation.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-gray-500 hover:text-white underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredAreas.length} opportunity{" "}
          {filteredAreas.length === 1 ? "area" : "areas"} found
        </p>
      </div>

      {/* Opportunity Area Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAreas.map((area) => {
          const SignalIcon = SIGNAL_ICONS[area.signal] || TrendingUp;
          const colorClass =
            SIGNAL_COLORS[area.signal] ||
            "text-lime-400 bg-lime-400/10 border-lime-400/30";

          return (
            <div
              key={area.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg border ${colorClass}`}>
                  <SignalIcon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-lime-400 flex items-center gap-1">
                    +{area.projectedAppreciation}%
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-500">projected</div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-1">
                {area.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{area.description}</p>

              {/* Signal Info */}
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Signal:</span>
                  <span className="text-white">{area.signalName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`${
                      area.status === "Completed"
                        ? "text-lime-400"
                        : area.status === "Under Construction"
                          ? "text-yellow-400"
                          : "text-blue-400"
                    }`}
                  >
                    {area.status}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <div className="text-gray-500">Properties</div>
                  <div className="text-white font-mono">
                    {area.parcelsInZone.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Avg. Value</div>
                  <div className="text-white font-mono">
                    ${(area.avgPropertyValue / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href={`/insights/${area.id}`}
                className="block w-full py-2.5 bg-white/5 text-white text-sm font-medium rounded-lg text-center hover:bg-white/10 transition-colors"
              >
                View Properties in Zone
              </Link>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAreas.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 mx-auto text-gray-600" />
          <p className="mt-4 text-white font-medium">
            No opportunity areas found
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-lime-400/10 text-lime-400 text-sm rounded-lg hover:bg-lime-400/20 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-2">
          How opportunity areas work
        </h4>
        <p className="text-sm text-gray-400">
          We analyze infrastructure projects (roads, schools, utilities, zoning
          changes) and identify geographic zones where properties historically
          appreciate faster than the market average. Click on any area to browse
          individual properties and filter by size, listing status, and more.
        </p>
      </div>
    </div>
  );
}
