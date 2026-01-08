"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Home,
  Ruler,
  BedDouble,
  Bath,
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

const statusConfig: Record<string, { label: string; color: string }> = {
  READY: { label: "Ready", color: "bg-green-500/20 text-green-400" },
  QUEUED: { label: "Queued", color: "bg-yellow-500/20 text-yellow-400" },
  RUNNING: { label: "Processing", color: "bg-blue-500/20 text-blue-400" },
  DRAFT: {
    label: "Draft",
    color: "bg-gray-500/20 text-[var(--muted-foreground)]",
  },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-400" },
  EXPIRED: {
    label: "Expired",
    color: "bg-gray-500/20 text-[var(--muted-foreground)]",
  },
};

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: property, isLoading } =
    trpc.property.getMyPropertyDetails.useQuery({ id });

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-16">
        <Home className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          Property not found
        </h3>
        <p className="text-[var(--muted-foreground)] mb-6">
          This property doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-lime-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>
      </div>
    );
  }

  const latestAppraisal = property.appraisalHistory[0];
  const latestValue = latestAppraisal?.report?.valueEstimate;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Properties
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {property.addressLine1}
          </h1>
          <p className="text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {property.city}, {property.state} {property.zipCode} •{" "}
            {property.county} County
          </p>
        </div>
        <Link
          href="/appraisals/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors"
        >
          <FileText className="w-4 h-4" />
          New Appraisal
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          <div className="bg-[var(--card)] border border-[var(--border)] clip-notch">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Property Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Type</span>
                  </div>
                  <p className="font-medium text-[var(--foreground)]">
                    {propertyTypeLabels[property.propertyType] ||
                      property.propertyType}
                  </p>
                </div>
                {property.sqft && (
                  <div>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                      <Ruler className="w-4 h-4" />
                      <span className="text-sm">Size</span>
                    </div>
                    <p className="font-medium text-[var(--foreground)]">
                      {property.sqft.toLocaleString()} sqft
                    </p>
                  </div>
                )}
                {property.bedrooms && (
                  <div>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                      <BedDouble className="w-4 h-4" />
                      <span className="text-sm">Bedrooms</span>
                    </div>
                    <p className="font-medium text-[var(--foreground)]">
                      {property.bedrooms}
                    </p>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                      <Bath className="w-4 h-4" />
                      <span className="text-sm">Bathrooms</span>
                    </div>
                    <p className="font-medium text-[var(--foreground)]">
                      {property.bathrooms}
                    </p>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Year Built</span>
                    </div>
                    <p className="font-medium text-[var(--foreground)]">
                      {property.yearBuilt}
                    </p>
                  </div>
                )}
                {property.lotSizeSqft && (
                  <div>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                      <Ruler className="w-4 h-4" />
                      <span className="text-sm">Lot Size</span>
                    </div>
                    <p className="font-medium text-[var(--foreground)]">
                      {property.lotSizeSqft.toLocaleString()} sqft
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appraisal History */}
          <div className="bg-[var(--card)] border border-[var(--border)] clip-notch">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Appraisal History ({property.totalAppraisals})
              </h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {property.appraisalHistory.map((appraisal) => (
                <Link
                  key={appraisal.id}
                  href={`/appraisals/${appraisal.id}`}
                  className="flex items-center justify-between p-4 hover:bg-[var(--muted)] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-2 py-1 text-xs font-medium rounded ${statusConfig[appraisal.status]?.color || statusConfig.DRAFT.color}`}
                    >
                      {statusConfig[appraisal.status]?.label ||
                        appraisal.status}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {appraisal.referenceCode}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDate(appraisal.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {appraisal.report?.valueEstimate && (
                      <div className="text-right">
                        <p className="font-bold text-[var(--foreground)]">
                          {formatCurrency(
                            Number(appraisal.report.valueEstimate),
                          )}
                        </p>
                        {appraisal.report.confidenceScore && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {(appraisal.report.confidenceScore * 100).toFixed(
                              0,
                            )}
                            % confidence
                          </p>
                        )}
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-lime-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Latest Valuation */}
          {latestValue && (
            <div className="bg-[var(--card)] border border-[var(--border)] clip-notch">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Latest Valuation
                </h2>
              </div>
              <div className="p-6 text-center">
                <DollarSign className="w-8 h-8 mx-auto text-lime-400 mb-2" />
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {formatCurrency(Number(latestValue))}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  As of {formatDate(latestAppraisal?.report?.generatedAt)}
                </p>
                {latestAppraisal?.report && (
                  <Link
                    href={`/appraisals/${latestAppraisal.id}`}
                    className="inline-flex items-center gap-1 mt-4 text-lime-400 hover:underline text-sm"
                  >
                    View Report
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-[var(--card)] border border-[var(--border)] clip-notch">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Quick Stats
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">
                  Total Appraisals
                </span>
                <span className="font-medium text-[var(--foreground)]">
                  {property.totalAppraisals}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">
                  First Appraisal
                </span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatDate(
                    property.appraisalHistory[
                      property.appraisalHistory.length - 1
                    ]?.createdAt,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">
                  Latest Appraisal
                </span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatDate(latestAppraisal?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Location */}
          {property.latitude && property.longitude && (
            <div className="bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)]">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  Location
                </h2>
              </div>
              <div className="h-48 bg-[var(--muted)] flex items-center justify-center">
                <MapPin className="w-8 h-8 text-[var(--muted-foreground)]" />
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                  {property.latitude.toFixed(6)},{" "}
                  {property.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
