"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  ChevronRight,
  Search,
  ArrowUpRight,
  Home,
  SlidersHorizontal,
  X,
  Tag,
  Ruler,
  Calendar,
  ChevronLeft,
} from "lucide-react";

// Mock area data - in real app comes from API based on ID
const AREA_DATA: Record<
  string,
  {
    name: string;
    description: string;
    signal: string;
    signalName: string;
    status: string;
    projectedAppreciation: number;
    county: string;
    city: string;
  }
> = {
  "north-austin-183": {
    name: "North Austin - Highway 183 Zone",
    description: "Properties near Highway 183 expansion project",
    signal: "ROAD_PROJECT",
    signalName: "Highway 183 Expansion",
    status: "Under Construction",
    projectedAppreciation: 18,
    county: "Travis",
    city: "Austin",
  },
  "round-rock-school": {
    name: "Round Rock - New Elementary Zone",
    description: "Properties within 2 miles of new elementary school",
    signal: "SCHOOL_CONSTRUCTION",
    signalName: "Bluebonnet Elementary",
    status: "Approved",
    projectedAppreciation: 12,
    county: "Williamson",
    city: "Round Rock",
  },
  "san-marcos-utility": {
    name: "San Marcos - Utility Expansion",
    description: "Previously unserviced land now with water/sewer access",
    signal: "INFRASTRUCTURE",
    signalName: "Water District Expansion",
    status: "Completed",
    projectedAppreciation: 35,
    county: "Hays",
    city: "San Marcos",
  },
  "cedar-park-zoning": {
    name: "Cedar Park - Mixed Use Rezoning",
    description: "Residential areas rezoned for mixed commercial/residential",
    signal: "ZONING_CHANGE",
    signalName: "Town Center Rezoning",
    status: "Approved",
    projectedAppreciation: 22,
    county: "Williamson",
    city: "Cedar Park",
  },
  "pflugerville-toll": {
    name: "Pflugerville - Toll Road Access",
    description: "Properties near new toll road interchange",
    signal: "ROAD_PROJECT",
    signalName: "SH 130 Interchange",
    status: "Under Construction",
    projectedAppreciation: 15,
    county: "Travis",
    city: "Pflugerville",
  },
  "kyle-school": {
    name: "Kyle - High School District",
    description: "New high school serving growing community",
    signal: "SCHOOL_CONSTRUCTION",
    signalName: "Kyle High School #2",
    status: "Under Construction",
    projectedAppreciation: 14,
    county: "Hays",
    city: "Kyle",
  },
};

// Mock properties - in real app comes from API
// For land: size is in acres. For residential/commercial: size is in sqft
const MOCK_PROPERTIES = [
  {
    id: "1",
    address: "1234 Oak Lane",
    city: "Austin",
    size: 2400,
    value: 425000,
    listingStatus: "off-market",
    propertyType: "residential",
    yearBuilt: 2015,
  },
  {
    id: "2",
    address: "5678 Cedar Drive",
    city: "Austin",
    size: 3200,
    value: 525000,
    listingStatus: "on-market",
    propertyType: "residential",
    yearBuilt: 2018,
  },
  {
    id: "3",
    address: "910 Pine Street",
    city: "Austin",
    size: 1800,
    value: 365000,
    listingStatus: "off-market",
    propertyType: "residential",
    yearBuilt: 2010,
  },
  {
    id: "4",
    address: "2345 Elm Avenue",
    city: "Austin",
    size: 5500,
    value: 680000,
    listingStatus: "on-market",
    propertyType: "residential",
    yearBuilt: 2020,
  },
  {
    id: "5",
    address: "6789 Maple Court",
    city: "Austin",
    size: 2100,
    value: 395000,
    listingStatus: "off-market",
    propertyType: "residential",
    yearBuilt: 2012,
  },
  {
    id: "6",
    address: "1111 Birch Road",
    city: "Austin",
    size: 4200,
    value: 575000,
    listingStatus: "on-market",
    propertyType: "residential",
    yearBuilt: 2019,
  },
  {
    id: "7",
    address: "2222 Willow Way",
    city: "Austin",
    size: 2800,
    value: 445000,
    listingStatus: "off-market",
    propertyType: "residential",
    yearBuilt: 2016,
  },
  {
    id: "8",
    address: "3333 Ash Boulevard",
    city: "Austin",
    size: 2.5,
    value: 320000,
    listingStatus: "off-market",
    propertyType: "land",
    yearBuilt: null,
  },
  {
    id: "9",
    address: "4444 Spruce Lane",
    city: "Austin",
    size: 3500,
    value: 495000,
    listingStatus: "on-market",
    propertyType: "residential",
    yearBuilt: 2017,
  },
  {
    id: "10",
    address: "5555 Redwood Circle",
    city: "Austin",
    size: 15000,
    value: 750000,
    listingStatus: "off-market",
    propertyType: "commercial",
    yearBuilt: 2021,
  },
  {
    id: "11",
    address: "6666 Sequoia Drive",
    city: "Austin",
    size: 2600,
    value: 415000,
    listingStatus: "off-market",
    propertyType: "residential",
    yearBuilt: 2014,
  },
  {
    id: "12",
    address: "7777 Cypress Street",
    city: "Austin",
    size: 4800,
    value: 620000,
    listingStatus: "on-market",
    propertyType: "residential",
    yearBuilt: 2022,
  },
  {
    id: "13",
    address: "8888 Ranch Road",
    city: "Austin",
    size: 8.2,
    value: 485000,
    listingStatus: "on-market",
    propertyType: "land",
    yearBuilt: null,
  },
  {
    id: "14",
    address: "9999 Prairie Way",
    city: "Austin",
    size: 15,
    value: 720000,
    listingStatus: "off-market",
    propertyType: "land",
    yearBuilt: null,
  },
  {
    id: "15",
    address: "1010 Meadow Lane",
    city: "Austin",
    size: 0.75,
    value: 185000,
    listingStatus: "on-market",
    propertyType: "land",
    yearBuilt: null,
  },
];

const FILTER_OPTIONS = {
  listingStatus: [
    { value: "", label: "All Listings" },
    { value: "on-market", label: "On Market" },
    { value: "off-market", label: "Off Market" },
  ],
  propertyType: [
    { value: "", label: "All Types" },
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "land", label: "Land" },
  ],
  sizeSqft: [
    { value: "", label: "Any Size" },
    { value: "0-2000", label: "Under 2,000 sqft" },
    { value: "2000-3000", label: "2,000 - 3,000 sqft" },
    { value: "3000-5000", label: "3,000 - 5,000 sqft" },
    { value: "5000+", label: "5,000+ sqft" },
  ],
  sizeAcres: [
    { value: "", label: "Any Size" },
    { value: "0-1", label: "Under 1 acre" },
    { value: "1-5", label: "1 - 5 acres" },
    { value: "5-10", label: "5 - 10 acres" },
    { value: "10+", label: "10+ acres" },
  ],
  value: [
    { value: "", label: "Any Price" },
    { value: "0-400000", label: "Under $400K" },
    { value: "400000-500000", label: "$400K - $500K" },
    { value: "500000-750000", label: "$500K - $750K" },
    { value: "750000+", label: "$750K+" },
  ],
};

export default function OpportunityAreaDetailPage() {
  const params = useParams();
  const areaId = params.id as string;

  const area = AREA_DATA[areaId] || AREA_DATA["north-austin-183"]; // fallback

  const [searchQuery, setSearchQuery] = useState("");
  const [listingFilter, setListingFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [valueFilter, setValueFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Determine if we're filtering for land (use acres) or buildings (use sqft)
  const isLandFilter = typeFilter === "land";
  const sizeOptions = isLandFilter
    ? FILTER_OPTIONS.sizeAcres
    : FILTER_OPTIONS.sizeSqft;

  // Clear size filter when property type changes
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setSizeFilter(""); // Reset size filter when switching types
  };

  // Filter properties
  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((property) => {
      // Search
      if (
        searchQuery &&
        !property.address.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Listing status
      if (listingFilter && property.listingStatus !== listingFilter)
        return false;
      // Property type
      if (typeFilter && property.propertyType !== typeFilter) return false;
      // Size - different logic for land (acres) vs buildings (sqft)
      if (sizeFilter) {
        const _isLand =
          typeFilter === "land" ||
          (!typeFilter && property.propertyType === "land");
        if (sizeFilter.endsWith("+")) {
          const minVal = Number(sizeFilter.replace("+", ""));
          if (property.size < minVal) return false;
        } else {
          const [min, max] = sizeFilter.split("-").map(Number);
          if (property.size < min || property.size > max) return false;
        }
      }
      // Value
      if (valueFilter) {
        if (valueFilter.endsWith("+")) {
          if (property.value < Number(valueFilter.replace("+", "")))
            return false;
        } else {
          const [min, max] = valueFilter.split("-").map(Number);
          if (property.value < min || property.value > max) return false;
        }
      }
      return true;
    });
  }, [searchQuery, listingFilter, typeFilter, sizeFilter, valueFilter]);

  const hasActiveFilters =
    listingFilter || typeFilter || sizeFilter || valueFilter;

  const clearFilters = () => {
    setListingFilter("");
    setTypeFilter("");
    setSizeFilter("");
    setValueFilter("");
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
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <Link href="/insights" className="text-gray-500 hover:text-white">
          Opportunities
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <span className="text-lime-400 truncate max-w-[200px]">
          {area.name}
        </span>
      </nav>

      {/* Back Link */}
      <Link
        href="/insights"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to all areas
      </Link>

      {/* Area Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{area.name}</h1>
            <p className="text-gray-400 mt-1">{area.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <span className="text-gray-500">
                Signal: <span className="text-white">{area.signalName}</span>
              </span>
              <span className="text-gray-500">
                Status:{" "}
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
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-lime-400 flex items-center gap-1 justify-end">
              +{area.projectedAppreciation}%
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-500">projected appreciation</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by address..."
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
                [listingFilter, typeFilter, sizeFilter, valueFilter].filter(
                  Boolean,
                ).length
              }
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Listing Status
              </label>
              <select
                value={listingFilter}
                onChange={(e) => setListingFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-lime-400/50"
              >
                {FILTER_OPTIONS.listingStatus.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Property Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-lime-400/50"
              >
                {FILTER_OPTIONS.propertyType.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Size {isLandFilter ? "(acres)" : "(sqft)"}
              </label>
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-lime-400/50"
              >
                {sizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Price
              </label>
              <select
                value={valueFilter}
                onChange={(e) => setValueFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:border-lime-400/50"
              >
                {FILTER_OPTIONS.value.map((opt) => (
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
          {filteredProperties.length}{" "}
          {filteredProperties.length === 1 ? "property" : "properties"} in this
          opportunity zone
        </p>
      </div>

      {/* Properties List */}
      <div className="space-y-3">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-white font-medium">{property.address}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      property.listingStatus === "on-market"
                        ? "bg-lime-400/10 text-lime-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {property.listingStatus === "on-market"
                      ? "On Market"
                      : "Off Market"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{property.city}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5" />
                    {property.propertyType === "land"
                      ? `${property.size} acres`
                      : `${property.size.toLocaleString()} sqft`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {property.propertyType}
                  </span>
                  {property.yearBuilt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Built {property.yearBuilt}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    ${(property.value / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-lime-400">
                    +{area.projectedAppreciation}% projected
                  </div>
                </div>
                <Link
                  href={`/appraisals/new?address=${encodeURIComponent(property.address)}`}
                  className="px-4 py-2 bg-lime-400 text-black text-sm font-medium rounded-lg hover:bg-lime-300 transition-colors whitespace-nowrap"
                >
                  Get Report
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-gray-600" />
          <p className="mt-4 text-white font-medium">No properties found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-lime-400/10 text-lime-400 text-sm rounded-lg hover:bg-lime-400/20 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
