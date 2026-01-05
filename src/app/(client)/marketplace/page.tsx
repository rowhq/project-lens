"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import { useCartStore } from "@/shared/lib/cart-store";
import {
  Search,
  FileText,
  MapPin,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  ChevronDown,
  Loader2,
  Building2,
  Home,
  Warehouse,
  Navigation,
  Layers,
  Droplets,
  Mountain,
  Compass,
  ScrollText,
} from "lucide-react";
import { STUDY_CATEGORIES } from "@/shared/config/constants";

const PROPERTY_CATEGORIES = [
  { value: "", label: "All Property Types", icon: FileText },
  { value: "residential", label: "Residential", icon: Home },
  { value: "commercial", label: "Commercial", icon: Building2 },
  { value: "land", label: "Land", icon: MapPin },
  { value: "industrial", label: "Industrial", icon: Warehouse },
];

type StudyCategory =
  | "APPRAISAL_REPORT"
  | "SOIL_STUDY"
  | "DRAINAGE_STUDY"
  | "CIVIL_ENGINEERING"
  | "ENVIRONMENTAL"
  | "GEOTECHNICAL"
  | "STRUCTURAL"
  | "FLOOD_RISK"
  | "ZONING_ANALYSIS"
  | "SURVEY"
  | "TITLE_REPORT"
  | "OTHER";

const STUDY_CATEGORY_OPTIONS: { value: "" | StudyCategory; label: string }[] = [
  { value: "", label: "All Study Types" },
  { value: "APPRAISAL_REPORT", label: "Appraisal Report" },
  { value: "SOIL_STUDY", label: "Soil Study" },
  { value: "DRAINAGE_STUDY", label: "Drainage Study" },
  { value: "CIVIL_ENGINEERING", label: "Civil Engineering" },
  { value: "ENVIRONMENTAL", label: "Environmental" },
  { value: "GEOTECHNICAL", label: "Geotechnical" },
  { value: "STRUCTURAL", label: "Structural" },
  { value: "FLOOD_RISK", label: "Flood Risk" },
  { value: "ZONING_ANALYSIS", label: "Zoning Analysis" },
  { value: "SURVEY", label: "Survey" },
  { value: "TITLE_REPORT", label: "Title Report" },
  { value: "OTHER", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "distance", label: "Nearest" },
];

export default function MarketplacePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [studyCategory, setStudyCategory] = useState<"" | StudyCategory>("");
  const [sortBy, setSortBy] = useState<
    "newest" | "price_asc" | "price_desc" | "popular" | "distance"
  >("newest");
  const [county, setCounty] = useState("");
  const cartItemCount = useCartStore((state) => state.getItemCount());

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

  const { data: listings, isLoading } = trpc.marketplace.list.useQuery({
    limit: 20,
    category: category || undefined,
    studyCategory: studyCategory || undefined,
    sortBy,
    search: search || undefined,
    county: county || undefined,
    latitude: useLocationFilter && userLocation ? userLocation.lat : undefined,
    longitude: useLocationFilter && userLocation ? userLocation.lng : undefined,
    radiusMiles: useLocationFilter ? radiusMiles : undefined,
  });

  const { data: stats } = trpc.marketplace.stats.useQuery();

  const getStudyCategoryIcon = (cat: string) => {
    switch (cat) {
      case "SOIL_STUDY":
        return <Layers className="w-3 h-3" />;
      case "DRAINAGE_STUDY":
        return <Droplets className="w-3 h-3" />;
      case "GEOTECHNICAL":
        return <Mountain className="w-3 h-3" />;
      case "SURVEY":
        return <Compass className="w-3 h-3" />;
      case "TITLE_REPORT":
        return <ScrollText className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            DD Marketplace
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Buy and sell due diligence reports from verified appraisals
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/marketplace/cart"
            className="relative px-4 py-2 border border-gray-700 clip-notch text-white font-mono text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-lime-400 text-black text-xs font-bold clip-notch-sm flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link
            href="/marketplace/my-listings"
            className="px-4 py-2 border border-gray-700 clip-notch text-white font-mono text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            My Listings
          </Link>
          <Link
            href="/marketplace/sell"
            className="px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors"
          >
            Sell a Report
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 clip-notch border border-gray-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
            <FileText className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">
              {stats?.totalListings || 0}
            </p>
            <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
              Active Listings
            </p>
          </div>
        </div>
        <div className="bg-gray-900 clip-notch border border-gray-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">
              {stats?.totalSales || 0}
            </p>
            <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
              Total Sales
            </p>
          </div>
        </div>
        <div className="bg-gray-900 clip-notch border border-gray-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-400/10 clip-notch-sm flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono">$75</p>
            <p className="text-sm text-gray-400 font-mono uppercase tracking-wider">
              Avg. Price
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 clip-notch border border-gray-800 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
            />
          </div>

          {/* Property Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
            >
              {PROPERTY_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Study Category */}
          <div className="relative">
            <select
              value={studyCategory}
              onChange={(e) =>
                setStudyCategory(e.target.value as "" | StudyCategory)
              }
              className="appearance-none px-4 py-2 pr-10 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
            >
              {STUDY_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none px-4 py-2 pr-10 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Second Row: Location Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* County */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="County"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-40 pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
            />
          </div>

          {/* Location Filter Button */}
          <button
            onClick={getUserLocation}
            disabled={loadingLocation}
            className={`px-4 py-2 flex items-center gap-2 border clip-notch-sm transition-colors ${
              useLocationFilter
                ? "bg-lime-400/20 text-lime-400 border-lime-400/50"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:border-lime-400/50"
            }`}
          >
            {loadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {useLocationFilter ? "Near Me" : "Use My Location"}
          </button>

          {/* Radius Slider (shows when location is active) */}
          {useLocationFilter && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Radius:</span>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(parseInt(e.target.value))}
                className="w-32 accent-lime-400"
              />
              <span className="text-sm text-lime-400 font-mono w-16">
                {radiusMiles} mi
              </span>
              <button
                onClick={() => {
                  setUseLocationFilter(false);
                  setUserLocation(null);
                }}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
        </div>
      ) : listings?.items?.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 clip-notch border border-gray-800">
          <FileText className="w-12 h-12 mx-auto text-gray-600" />
          <p className="mt-4 text-gray-400">No listings found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings?.items?.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace/listing/${listing.id}`}
              className="bg-gray-900 clip-notch border border-gray-800 overflow-hidden hover:border-lime-400/50 transition-colors group"
            >
              {/* Thumbnail placeholder */}
              <div className="h-40 bg-gray-800 flex items-center justify-center">
                {listing.studyCategory && !listing.report ? (
                  <div className="text-center">
                    {getStudyCategoryIcon(listing.studyCategory)}
                    <p className="text-xs text-gray-500 mt-1">
                      {STUDY_CATEGORIES[
                        listing.studyCategory as keyof typeof STUDY_CATEGORIES
                      ]?.label || listing.studyCategory}
                    </p>
                  </div>
                ) : (
                  <FileText className="w-12 h-12 text-gray-600" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white group-hover:text-lime-400 transition-colors line-clamp-2">
                    {listing.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <span className="px-2 py-0.5 bg-lime-400/10 text-lime-400 text-xs font-mono uppercase tracking-wider clip-notch-sm">
                      {listing.category}
                    </span>
                    {listing.studyCategory && (
                      <span className="px-2 py-0.5 bg-blue-400/10 text-blue-400 text-xs font-mono uppercase tracking-wider clip-notch-sm flex items-center gap-1">
                        {getStudyCategoryIcon(listing.studyCategory)}
                        {listing.studyCategory
                          .replace(/_/g, " ")
                          .substring(0, 10)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {listing.city ||
                      listing.report?.appraisalRequest?.property?.city}
                    ,{" "}
                    {listing.state ||
                      listing.report?.appraisalRequest?.property?.state}
                  </span>
                </div>

                {listing.county && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{listing.county} County</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-lime-400" />
                    <span className="text-lg font-bold text-white font-mono">
                      {Number(listing.price).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{listing._count.purchases} sold</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
                  {listing.report?.valueEstimate && (
                    <span>
                      Est. Value: $
                      {Number(listing.report.valueEstimate).toLocaleString()}
                    </span>
                  )}
                  <span>
                    {listing.report?.type?.replace("_", " ") ||
                      listing.studyCategory?.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
