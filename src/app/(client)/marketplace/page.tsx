"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import { useCartStore } from "@/shared/lib/cart-store";
import {
  FileText,
  MapPin,
  Eye,
  ShoppingCart,
  Loader2,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { FilterSelect } from "@/shared/components/ui/FilterSelect";
import { EmptyState } from "@/shared/components/ui/EmptyState";

// Category configuration with badge-style colors (transparent bg, colored border/text)
const CATEGORY_CONFIG: Record<
  string,
  { label: string; textColor: string; bgColor: string; borderColor: string }
> = {
  ENVIRONMENTAL: {
    label: "Phase I ESA",
    textColor: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
  },
  SURVEY: {
    label: "Survey",
    textColor: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
  },
  CIVIL_ENGINEERING: {
    label: "Civil Plans",
    textColor: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
  GEOTECHNICAL: {
    label: "Geotechnical",
    textColor: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
  },
  TITLE_REPORT: {
    label: "Title Report",
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
  },
  ZONING_ANALYSIS: {
    label: "Zoning Docs",
    textColor: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/30",
  },
  SOIL_STUDY: {
    label: "Soil Study",
    textColor: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
  },
  APPRAISAL_REPORT: {
    label: "Appraisal",
    textColor: "text-lime-400",
    bgColor: "bg-lime-400/10",
    borderColor: "border-lime-400/30",
  },
  DRAINAGE_STUDY: {
    label: "Drainage",
    textColor: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/30",
  },
  STRUCTURAL: {
    label: "Structural",
    textColor: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
  },
  FLOOD_RISK: {
    label: "Flood Risk",
    textColor: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/30",
  },
  OTHER: {
    label: "Other",
    textColor: "text-[var(--muted-foreground)]",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30",
  },
};

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  ...Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  })),
];

type StudyCategory = keyof typeof CATEGORY_CONFIG;

export default function MarketplacePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StudyCategory | "">("");
  const addItem = useCartStore((state) => state.addItem);
  const hasItem = useCartStore((state) => state.hasItem);

  const {
    data: listingsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.marketplace.list.useInfiniteQuery(
    {
      limit: 12,
      studyCategory: (category || undefined) as
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
        | "OTHER"
        | undefined,
      search: search || undefined,
      sortBy: "newest",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // Flatten pages into single array
  const listings = listingsData?.pages.flatMap((page) => page.items) ?? [];

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

  // Get category config
  const getCategoryConfig = (studyCategory: string | null) => {
    if (studyCategory && CATEGORY_CONFIG[studyCategory]) {
      return CATEGORY_CONFIG[studyCategory];
    }
    return CATEGORY_CONFIG.OTHER;
  };

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          DD Marketplace
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Purchase unused Due Diligence assets - Phase I ESAs, surveys, civil
          plans, and more
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title, location, tags..."
          showShortcut
          debounceMs={300}
        />

        {/* Category Filter */}
        <FilterSelect
          value={category}
          onChange={(value) => setCategory(value as StudyCategory | "")}
          options={CATEGORY_OPTIONS}
        />
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No listings found"
          description="Try adjusting your search or filters"
          action={{
            label: "Clear Filters",
            onClick: () => {
              setSearch("");
              setCategory("");
            },
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const categoryConfig = getCategoryConfig(listing.studyCategory);
              const propertyData = listing.report?.appraisalRequest?.property;
              const location = propertyData
                ? `${propertyData.city}, ${propertyData.state}`
                : listing.city && listing.state
                  ? `${listing.city}, ${listing.state}`
                  : listing.county
                    ? `${listing.county} County, TX`
                    : "Texas";
              const inCart = hasItem(listing.id);
              const dateCreated = formatDate(listing.createdAt);

              return (
                <div
                  key={listing.id}
                  className="relative bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden hover:border-lime-400/50 transition-all"
                >
                  {/* L-Bracket Corners */}
                  <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-[var(--border)]" />
                  <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-[var(--border)]" />

                  {/* Category Header - Badge style */}
                  <div
                    className={`px-4 py-2 border-b ${categoryConfig.borderColor} ${categoryConfig.bgColor}`}
                  >
                    <span
                      className={`font-mono text-sm uppercase tracking-wider ${categoryConfig.textColor}`}
                    >
                      {categoryConfig.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem]">
                      {listing.title}
                    </h3>

                    {/* Description - truncated */}
                    {listing.description && (
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {/* Meta info row */}
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </span>
                      {dateCreated && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {dateCreated}
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {listing.viewCount || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {listing._count?.purchases || 0} sold
                      </span>
                    </div>

                    {/* Price */}
                    <div className="pt-3 border-t border-[var(--border)]">
                      <span className="text-2xl font-bold text-white font-mono">
                        ${Number(listing.price).toLocaleString()}
                      </span>
                      <span className="text-[var(--muted-foreground)] text-sm ml-2">
                        USD
                      </span>
                    </div>

                    {/* Action Buttons - Brand aligned */}
                    <div className="flex gap-3 pt-2">
                      <Link
                        href={`/marketplace/listing/${listing.id}`}
                        className="flex-1 px-4 py-2.5 border border-[var(--border)] clip-notch text-center text-[var(--foreground)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--secondary)] hover:border-lime-400/50 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={(e) => handleAddToCart(e, listing)}
                        disabled={inCart}
                        className={`flex-1 px-4 py-2.5 clip-notch font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                          inCart
                            ? "bg-gray-700 text-[var(--muted-foreground)] cursor-not-allowed"
                            : "bg-lime-400 text-black hover:bg-lime-300"
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {inCart ? "In Cart" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-mono text-sm uppercase tracking-wider clip-notch hover:bg-[var(--muted)] hover:border-lime-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
