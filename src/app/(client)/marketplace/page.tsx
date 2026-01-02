"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useCartStore } from "@/shared/lib/cart-store";
import {
  Search,
  Filter,
  FileText,
  MapPin,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Star,
  ChevronDown,
  Loader2,
  Building2,
  Home,
  Warehouse,
} from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Categories", icon: FileText },
  { value: "residential", label: "Residential", icon: Home },
  { value: "commercial", label: "Commercial", icon: Building2 },
  { value: "land", label: "Land", icon: MapPin },
  { value: "industrial", label: "Industrial", icon: Warehouse },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "price_asc" | "price_desc" | "popular"
  >("newest");
  const [showFilters, setShowFilters] = useState(false);
  const cartItemCount = useCartStore((state) => state.getItemCount());

  const { data: listings, isLoading } = trpc.marketplace.list.useQuery({
    limit: 20,
    category: category || undefined,
    sortBy,
    search: search || undefined,
  });

  const { data: stats } = trpc.marketplace.stats.useQuery();

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
      <div className="bg-gray-900 clip-notch border border-gray-800 p-4">
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

          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 bg-gray-900 border border-gray-700 clip-notch-sm text-white font-mono text-sm focus:outline-none focus:border-lime-400/50"
            >
              {CATEGORIES.map((cat) => (
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
                <FileText className="w-12 h-12 text-gray-600" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white group-hover:text-lime-400 transition-colors line-clamp-2">
                    {listing.title}
                  </h3>
                  <span className="px-2 py-0.5 bg-lime-400/10 text-lime-400 text-xs font-mono uppercase tracking-wider clip-notch-sm">
                    {listing.category}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {listing.report.appraisalRequest?.property?.city},{" "}
                    {listing.report.appraisalRequest?.property?.state}
                  </span>
                </div>

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
                  <span>
                    Est. Value: $
                    {Number(listing.report.valueEstimate).toLocaleString()}
                  </span>
                  <span>{listing.report.type.replace("_", " ")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
