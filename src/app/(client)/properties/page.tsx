"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  Search,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
  Home,
  FileText,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/shared/components/ui/Skeleton";

const propertyTypeLabels: Record<string, string> = {
  SINGLE_FAMILY: "Single Family",
  MULTI_FAMILY: "Multi Family",
  CONDO: "Condo",
  TOWNHOUSE: "Townhouse",
  COMMERCIAL: "Commercial",
  LAND: "Land",
  MIXED_USE: "Mixed Use",
};

const statusColors: Record<string, string> = {
  READY: "bg-green-500/20 text-green-400",
  QUEUED: "bg-yellow-500/20 text-yellow-400",
  RUNNING: "bg-blue-500/20 text-blue-400",
  DRAFT: "bg-gray-500/20 text-[var(--muted-foreground)]",
  FAILED: "bg-red-500/20 text-red-400",
  EXPIRED: "bg-gray-500/20 text-[var(--muted-foreground)]",
};

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = trpc.property.listMyProperties.useQuery({
    limit: 50,
    search: searchQuery || undefined,
  });

  const properties = data?.items || [];

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            My Properties
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Properties you&apos;ve valuated with TruPlat
          </p>
        </div>
        <Link
          href="/appraisals/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors"
        >
          <FileText className="w-4 h-4" />
          New Appraisal
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search by address, city, or county..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search properties"
          className="w-full pl-12 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-lime-400 clip-notch"
        />
      </div>

      {/* Stats Summary */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-400/10 rounded">
                <Building2 className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {properties.length}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Total Properties
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-400/10 rounded">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {properties.reduce((acc, p) => acc + p.totalAppraisals, 0)}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Total Appraisals
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-400/10 rounded">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {formatCurrency(
                    properties.reduce(
                      (acc, p) => acc + (Number(p.latestValue) || 0),
                      0,
                    ) / (properties.filter((p) => p.latestValue).length || 1),
                  )}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Avg. Valuation
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] p-4 clip-notch"
            >
              <div className="flex items-start gap-4">
                <Skeleton className="w-24 h-24 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-[var(--card)] border border-[var(--border)] clip-notch">
          <Home className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No properties yet
          </h3>
          <p className="text-[var(--muted-foreground)] mb-6">
            Start by creating your first appraisal request
          </p>
          <Link
            href="/appraisals/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors"
          >
            <FileText className="w-4 h-4" />
            New Appraisal
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="block bg-[var(--card)] border border-[var(--border)] p-4 clip-notch hover:border-lime-400/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Address */}
                  <h3 className="text-lg font-semibold text-[var(--foreground)] truncate group-hover:text-lime-400 transition-colors">
                    {property.addressLine1}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {property.city}, {property.state} {property.zipCode}
                  </p>

                  {/* Property Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <span className="px-2 py-0.5 bg-[var(--muted)] text-[var(--muted-foreground)] rounded">
                      {propertyTypeLabels[property.propertyType] ||
                        property.propertyType}
                    </span>
                    {property.sqft && (
                      <span className="text-[var(--muted-foreground)]">
                        {property.sqft.toLocaleString()} sqft
                      </span>
                    )}
                    {property.bedrooms && property.bathrooms && (
                      <span className="text-[var(--muted-foreground)]">
                        {property.bedrooms} bed / {property.bathrooms} bath
                      </span>
                    )}
                    {property.yearBuilt && (
                      <span className="text-[var(--muted-foreground)]">
                        Built {property.yearBuilt}
                      </span>
                    )}
                  </div>

                  {/* Latest Appraisal Info */}
                  {property.latestAppraisal && (
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[property.latestAppraisal.status] || statusColors.DRAFT}`}
                      >
                        {property.latestAppraisal.status}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(property.latestAppraisal.createdAt)}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {property.totalAppraisals} appraisal
                        {property.totalAppraisals !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Value & Arrow */}
                <div className="flex items-center gap-4">
                  {property.latestValue && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--foreground)]">
                        {formatCurrency(Number(property.latestValue))}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Est. Value
                      </p>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-lime-400 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
