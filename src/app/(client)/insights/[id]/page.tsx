"use client";

import { use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { trpc } from "@/shared/lib/trpc";
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  Building2,
  GraduationCap,
  Route,
  Landmark,
  Loader2,
  Calendar,
  DollarSign,
  Target,
  Clock,
  BarChart3,
  ExternalLink,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  FileText,
  Home,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Dynamic import for MapView
const MapView = dynamic(
  () => import("@/shared/components/common/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-800 animate-pulse clip-notch" />
    ),
  },
);

type InsightType =
  | "MUNICIPAL_BOND"
  | "SCHOOL_CONSTRUCTION"
  | "ROAD_PROJECT"
  | "ZONING_CHANGE"
  | "DEVELOPMENT_PERMIT"
  | "INFRASTRUCTURE"
  | "TAX_INCENTIVE";

const TYPE_CONFIG: Record<
  InsightType,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  MUNICIPAL_BOND: {
    label: "Municipal Bond",
    icon: <Landmark className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  SCHOOL_CONSTRUCTION: {
    label: "School Construction",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  ROAD_PROJECT: {
    label: "Road Project",
    icon: <Route className="w-5 h-5" />,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  ZONING_CHANGE: {
    label: "Zoning Change",
    icon: <Layers className="w-5 h-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  DEVELOPMENT_PERMIT: {
    label: "Development Permit",
    icon: <Building2 className="w-5 h-5" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  INFRASTRUCTURE: {
    label: "Infrastructure",
    icon: <Activity className="w-5 h-5" />,
    color: "text-teal-400",
    bgColor: "bg-teal-400/10",
  },
  TAX_INCENTIVE: {
    label: "Tax Incentive",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: {
    label: "Active",
    color: "text-lime-400 bg-lime-400/10 border-lime-400/30",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  },
  PENDING: {
    label: "Pending",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-400 bg-red-400/10 border-red-400/30",
  },
};

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const {
    data: insight,
    isLoading,
    error,
  } = trpc.insights.getInsightById.useQuery({
    id: resolvedParams.id,
  });

  const formatCurrency = (value: unknown) => {
    if (!value) return null;
    // Handle Prisma Decimal, number, or string
    const num =
      typeof value === "object" && value !== null && "toNumber" in value
        ? (value as { toNumber: () => number }).toNumber()
        : typeof value === "string"
          ? parseFloat(value)
          : Number(value);
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(1)}B`;
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatFullDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="text-center py-16">
        <Activity className="w-16 h-16 mx-auto text-gray-600" />
        <h2 className="mt-4 text-xl font-bold text-white">Insight Not Found</h2>
        <p className="text-gray-400 mt-2">
          The insight you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Insights
        </Link>
      </div>
    );
  }

  const typeConfig =
    TYPE_CONFIG[insight.type as InsightType] || TYPE_CONFIG.INFRASTRUCTURE;
  const statusConfig = STATUS_CONFIG[insight.status] || STATUS_CONFIG.ACTIVE;

  // Map marker
  const markers = [
    {
      id: insight.id,
      latitude: insight.latitude,
      longitude: insight.longitude,
      color: "#A3E635",
      label: insight.title.substring(0, 20),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-white transition-colors flex items-center gap-1"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only md:not-sr-only">Dashboard</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <Link
          href="/insights"
          className="text-gray-500 hover:text-white transition-colors"
        >
          Insights
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <span className="text-lime-400 font-medium truncate max-w-[200px]">
          {insight.title}
        </span>
      </nav>

      {/* Header */}
      <div className="relative bg-gray-900 border border-gray-800 clip-notch p-6">
        {/* L-Bracket Corners */}
        <div className="absolute -top-px -left-px w-4 h-4 border-l-2 border-t-2 border-gray-700" />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-r-2 border-b-2 border-gray-700" />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 ${typeConfig.bgColor} clip-notch`}>
              <span className={typeConfig.color}>{typeConfig.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs font-mono uppercase tracking-wider border clip-notch ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-mono uppercase tracking-wider ${typeConfig.bgColor} ${typeConfig.color} border border-current/30 clip-notch`}
                >
                  {typeConfig.label}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-2">
                {insight.title}
              </h1>
              <p className="text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {insight.city ? `${insight.city}, ` : ""}
                {insight.county} County, {insight.state}
                {insight.zipCode && ` ${insight.zipCode}`}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link
              href={`/map?lat=${insight.latitude}&lng=${insight.longitude}&zoom=14`}
              className="px-4 py-2 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              View on Map
            </Link>
            {insight.sourceUrl && (
              <a
                href={insight.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Source
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="bg-gray-900 border border-gray-800 p-6 clip-notch">
        <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Impact Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-3xl font-bold font-mono flex items-center gap-1">
              {insight.avgValueChange !== null ? (
                <span
                  className={
                    insight.avgValueChange > 0
                      ? "text-lime-400"
                      : "text-red-400"
                  }
                >
                  {insight.avgValueChange > 0 ? "+" : ""}
                  {insight.avgValueChange.toFixed(1)}%
                  {insight.avgValueChange > 0 ? (
                    <ArrowUpRight className="w-5 h-5 inline" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 inline" />
                  )}
                </span>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Value Change
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white font-mono">
              {insight.parcelsAffected?.toLocaleString() || "—"}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <Target className="w-4 h-4" />
              Parcels Affected
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white font-mono">
              {insight.lagPeriodYears !== null
                ? `${insight.lagPeriodYears.toFixed(1)} yrs`
                : "—"}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Appreciation Lag
            </p>
          </div>
          <div className="space-y-1">
            <p
              className={`text-3xl font-bold font-mono ${
                insight.correlation !== null
                  ? insight.correlation > 0.5
                    ? "text-lime-400"
                    : insight.correlation > 0.3
                      ? "text-yellow-400"
                      : "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              {insight.correlation !== null
                ? insight.correlation.toFixed(2)
                : "—"}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Correlation
              <span className="group relative">
                <Info className="w-3 h-3 text-gray-600 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  0-1 scale: higher = stronger relationship
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Details */}
        <div className="relative bg-gray-900 border border-gray-800 p-6 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Project Details
          </h2>
          <dl className="space-y-3">
            {insight.projectYear && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Project Year</dt>
                <dd className="text-white font-mono">{insight.projectYear}</dd>
              </div>
            )}
            {insight.estimatedValue && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Estimated Value</dt>
                <dd className="text-lime-400 font-mono">
                  {formatCurrency(insight.estimatedValue)}
                </dd>
              </div>
            )}
            {insight.fundingAmount && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Funding Amount</dt>
                <dd className="text-white font-mono">
                  {formatCurrency(insight.fundingAmount)}
                </dd>
              </div>
            )}
            {insight.expectedROI !== null && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Expected ROI</dt>
                <dd className="text-lime-400 font-mono">
                  +{insight.expectedROI?.toFixed(1)}%
                </dd>
              </div>
            )}
            {insight.impactRadiusMiles && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Impact Radius</dt>
                <dd className="text-white font-mono">
                  {insight.impactRadiusMiles} miles
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Data Source</dt>
              <dd className="text-gray-300 text-sm">{insight.source}</dd>
            </div>
          </dl>
        </div>

        {/* Timeline */}
        <div className="relative bg-gray-900 border border-gray-800 p-6 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline
          </h2>
          <div className="space-y-4">
            {insight.announcedAt && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <div>
                  <p className="text-white font-medium">Announced</p>
                  <p className="text-sm text-gray-400">
                    {formatFullDate(insight.announcedAt)}
                  </p>
                </div>
              </div>
            )}
            {insight.expectedStart && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <div>
                  <p className="text-white font-medium">Expected Start</p>
                  <p className="text-sm text-gray-400">
                    {formatFullDate(insight.expectedStart)}
                  </p>
                </div>
              </div>
            )}
            {insight.expectedEnd && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-lime-400 rounded-full" />
                <div>
                  <p className="text-white font-medium">Expected Completion</p>
                  <p className="text-sm text-gray-400">
                    {formatFullDate(insight.expectedEnd)}
                  </p>
                </div>
              </div>
            )}
            {!insight.announcedAt &&
              !insight.expectedStart &&
              !insight.expectedEnd && (
                <p className="text-gray-500 text-sm">
                  No timeline data available
                </p>
              )}
            {insight.createdAt && (
              <div className="pt-3 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  Added to database: {formatDate(insight.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {insight.description && (
        <div className="relative bg-gray-900 border border-gray-800 p-6 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
            Description
          </h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {insight.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {insight.tags && insight.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {insight.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-800 text-gray-400 text-sm border border-gray-700 clip-notch"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Location Map */}
      {insight.latitude && insight.longitude && (
        <div className="relative bg-gray-900 border border-gray-800 clip-notch overflow-hidden">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700 z-10" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700 z-10" />

          <div className="p-4 border-b border-gray-800">
            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h2>
          </div>
          <MapView
            markers={markers}
            center={[insight.longitude, insight.latitude]}
            zoom={13}
            style={{ height: 300 }}
            showBaseLayerSwitcher
          />
          <div className="p-3 bg-gray-800/50 text-xs text-gray-500 font-mono">
            {insight.latitude.toFixed(6)}, {insight.longitude.toFixed(6)}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <Link
          href="/insights"
          className="px-4 py-2.5 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to All Insights
        </Link>
        <p className="text-xs text-gray-600 hidden md:block">
          Use the buttons above to view on map or access source documents
        </p>
      </div>
    </div>
  );
}
