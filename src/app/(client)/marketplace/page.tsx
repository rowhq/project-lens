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
  Eye,
  ShoppingCart,
  ChevronDown,
  Loader2,
  File,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "APPRAISAL_REPORT", label: "Appraisal Report" },
  { value: "ENVIRONMENTAL", label: "Phase I ESA" },
  { value: "SURVEY", label: "Survey" },
  { value: "CIVIL_ENGINEERING", label: "Civil Plans" },
  { value: "GEOTECHNICAL", label: "Geotechnical" },
  { value: "TITLE_REPORT", label: "Title Report" },
  { value: "ZONING_ANALYSIS", label: "Zoning Docs" },
  { value: "SOIL_STUDY", label: "Soil Study" },
  { value: "DRAINAGE_STUDY", label: "Drainage Study" },
  { value: "STRUCTURAL", label: "Structural" },
  { value: "FLOOD_RISK", label: "Flood Risk" },
  { value: "OTHER", label: "Other" },
];

const CATEGORY_LABELS: Record<string, string> = {
  APPRAISAL_REPORT: "Appraisal",
  ENVIRONMENTAL: "Phase I ESA",
  SURVEY: "Survey",
  CIVIL_ENGINEERING: "Civil Plans",
  GEOTECHNICAL: "Geotechnical",
  TITLE_REPORT: "Title Report",
  ZONING_ANALYSIS: "Zoning Docs",
  SOIL_STUDY: "Soil Study",
  DRAINAGE_STUDY: "Drainage Study",
  STRUCTURAL: "Structural",
  FLOOD_RISK: "Flood Risk",
  OTHER: "Other",
};

type StudyCategory =
  | "APPRAISAL_REPORT"
  | "ENVIRONMENTAL"
  | "SURVEY"
  | "CIVIL_ENGINEERING"
  | "GEOTECHNICAL"
  | "TITLE_REPORT"
  | "ZONING_ANALYSIS"
  | "SOIL_STUDY"
  | "DRAINAGE_STUDY"
  | "STRUCTURAL"
  | "FLOOD_RISK"
  | "OTHER";

export default function MarketplacePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StudyCategory | "">("");
  const addItem = useCartStore((state) => state.addItem);
  const hasItem = useCartStore((state) => state.hasItem);

  const { data: listings, isLoading } = trpc.marketplace.list.useQuery({
    limit: 20,
    studyCategory: category || undefined,
    search: search || undefined,
    sortBy: "newest",
  });

  const handleAddToCart = (
    e: React.MouseEvent,
    listing: {
      id: string;
      title: string;
      price: number | { toNumber: () => number };
      city?: string | null;
      state?: string | null;
      studyCategory?: string | null;
      report?: { type?: string | null } | null;
    },
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasItem(listing.id)) {
      toast({
        title: "Already in cart",
        description: "This item is already in your cart",
      });
      return;
    }

    addItem({
      listingId: listing.id,
      title: listing.title,
      price:
        typeof listing.price === "number"
          ? listing.price
          : listing.price.toNumber(),
      property: listing.city
        ? {
            city: listing.city,
            state: listing.state || "TX",
          }
        : undefined,
      reportType: listing.studyCategory || listing.report?.type || "Document",
    });

    toast({
      title: "Added to cart",
      description: listing.title,
    });
  };

  // Get category label for display
  const getCategoryLabel = (
    studyCategory: string | null,
    reportType?: string | null,
  ) => {
    if (studyCategory && CATEGORY_LABELS[studyCategory]) {
      return CATEGORY_LABELS[studyCategory];
    }
    if (reportType) {
      return reportType.replace(/_/g, " ");
    }
    return "Document";
  };

  // Generate tags from listing data
  const generateTags = (listing: {
    category?: string | null;
    county?: string | null;
    city?: string | null;
    state?: string | null;
    report?: { type?: string | null } | null;
  }) => {
    const tags: string[] = [];
    if (listing.category) tags.push(listing.category.toLowerCase());
    if (listing.county)
      tags.push(listing.county.toLowerCase().replace(" county", ""));
    if (listing.city)
      tags.push(listing.city.toLowerCase().replace(/\s+/g, "-"));
    return tags.slice(0, 3);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-emerald-400">DD Marketplace</h1>
        <p className="text-gray-400 mt-1">
          Purchase unused Due Diligence assets - Phase I ESAs, surveys, civil
          plans, and more
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title, location, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as StudyCategory | "")}
            className="appearance-none px-4 py-3 pr-10 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 min-w-[180px]"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : listings?.items?.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto text-gray-600" />
          <p className="mt-4 text-xl text-gray-400">No listings found</p>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings?.items?.map((listing) => {
            const categoryLabel = getCategoryLabel(
              listing.studyCategory,
              listing.report?.type,
            );
            const tags = generateTags(listing);
            const propertyData = listing.report?.appraisalRequest?.property;
            const address = propertyData
              ? `${propertyData.city}, ${propertyData.state}`
              : `${listing.city || ""}, ${listing.state || "TX"}`.trim();
            const fileCount =
              listing.documents?.length || (listing.report ? 1 : 0);
            const inCart = hasItem(listing.id);

            return (
              <Link
                key={listing.id}
                href={`/marketplace/listing/${listing.id}`}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all group"
              >
                {/* Category Header */}
                <div className="bg-emerald-600 px-4 py-2">
                  <span className="text-white font-medium text-sm">
                    {categoryLabel}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {listing.title}
                  </h3>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {listing.description}
                    </p>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{address}</span>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <File className="w-4 h-4" />
                      {fileCount} {fileCount === 1 ? "file" : "files"}
                    </span>
                  </div>

                  {/* Views & Sold */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {listing.viewCount || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4" />
                      {listing._count?.purchases || 0} sold
                    </span>
                  </div>

                  {/* Price & Buy Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <div>
                      <span className="text-2xl font-bold text-emerald-400">
                        ${Number(listing.price).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, listing)}
                      disabled={inCart}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        inCart
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {inCart ? "In Cart" : "Buy Now"}
                    </button>
                  </div>

                  {/* License */}
                  <p className="text-xs text-gray-500">Non-exclusive license</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
