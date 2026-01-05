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
  DollarSign,
  Target,
  Clock,
  BarChart3,
  Layers,
  Activity,
  ArrowUpRight,
  Home,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Zap,
  ExternalLink,
  Calendar,
  Shield,
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

// Type icons for infrastructure
const TYPE_ICONS: Record<string, React.ReactNode> = {
  MUNICIPAL_BOND: <Landmark className="w-4 h-4" />,
  SCHOOL_CONSTRUCTION: <GraduationCap className="w-4 h-4" />,
  ROAD_PROJECT: <Route className="w-4 h-4" />,
  ZONING_CHANGE: <Layers className="w-4 h-4" />,
  DEVELOPMENT_PERMIT: <Building2 className="w-4 h-4" />,
  INFRASTRUCTURE: <Activity className="w-4 h-4" />,
  TAX_INCENTIVE: <DollarSign className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  MUNICIPAL_BOND: "text-blue-400 bg-blue-400/10",
  SCHOOL_CONSTRUCTION: "text-green-400 bg-green-400/10",
  ROAD_PROJECT: "text-orange-400 bg-orange-400/10",
  ZONING_CHANGE: "text-purple-400 bg-purple-400/10",
  DEVELOPMENT_PERMIT: "text-cyan-400 bg-cyan-400/10",
  INFRASTRUCTURE: "text-teal-400 bg-teal-400/10",
  TAX_INCENTIVE: "text-yellow-400 bg-yellow-400/10",
};

const STATUS_BADGES: Record<string, string> = {
  ACTIVE: "text-lime-400 bg-lime-400/10 border-lime-400/30",
  COMPLETED: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/30",
};

const RISK_CONFIG = {
  LOW: {
    bg: "bg-green-400/10",
    border: "border-green-400/30",
    text: "text-green-400",
    label: "Low Risk",
  },
  MEDIUM: {
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
    text: "text-yellow-400",
    label: "Medium Risk",
  },
  HIGH: {
    bg: "bg-red-400/10",
    border: "border-red-400/30",
    text: "text-red-400",
    label: "High Risk",
  },
};

export default function PropertyAnalysisPage({
  params,
}: {
  params: Promise<{ parcelId: string }>;
}) {
  const resolvedParams = use(params);

  const { data, isLoading, error } = trpc.insights.getPropertyAnalysis.useQuery(
    {
      parcelId: resolvedParams.parcelId,
    },
  );

  const formatCurrency = (value: unknown) => {
    if (!value) return null;
    const num =
      typeof value === "object" && value !== null && "toNumber" in value
        ? (value as { toNumber: () => number }).toNumber()
        : typeof value === "string"
          ? parseFloat(value)
          : Number(value);
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (error || !data?.property) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-16 h-16 mx-auto text-gray-600" />
        <h2 className="mt-4 text-xl font-bold text-white">
          Property Not Found
        </h2>
        <p className="text-gray-400 mt-2">
          The property you&apos;re looking for doesn&apos;t exist or has been
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

  const { property, analysis, signals } = data;
  const fullAddress = [
    property.addressLine1,
    property.city,
    property.state,
    property.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  // Map markers for property and signals
  const markers = [
    ...(property.latitude && property.longitude
      ? [
          {
            id: property.parcelId,
            latitude: property.latitude,
            longitude: property.longitude,
            color: "#A3E635", // Lime for property
            label: "Property",
          },
        ]
      : []),
    ...signals
      .filter((s) => s.latitude && s.longitude)
      .map((s) => ({
        id: s.id,
        latitude: s.latitude!,
        longitude: s.longitude!,
        color: "#FB923C", // Orange for signals
        label: s.title.substring(0, 15),
      })),
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
          Property Analysis
        </span>
      </nav>

      {/* Header */}
      <div className="relative bg-gray-900 border border-gray-800 clip-notch p-6">
        <div className="absolute -top-px -left-px w-4 h-4 border-l-2 border-t-2 border-gray-700" />
        <div className="absolute -bottom-px -right-px w-4 h-4 border-r-2 border-b-2 border-gray-700" />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-lime-400/10 clip-notch">
              <MapPin className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {property.addressLine1 || property.parcelId}
              </h1>
              <p className="text-gray-400 mt-1">
                {property.city}, {property.state} {property.zipCode}
              </p>
              {property.county && (
                <p className="text-gray-500 text-sm mt-1">
                  {property.county} County
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {analysis && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1 text-lime-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-bold font-mono">
                    +{analysis.projectedAppreciation}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">Projected (3yr)</p>
              </div>
              <div
                className={`px-3 py-1.5 rounded border font-mono text-sm ${
                  RISK_CONFIG[analysis.risk].bg
                } ${RISK_CONFIG[analysis.risk].border} ${
                  RISK_CONFIG[analysis.risk].text
                }`}
              >
                {RISK_CONFIG[analysis.risk].label}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No Analysis State */}
      {!analysis && (
        <div className="relative bg-gray-900 border border-gray-800 clip-notch p-8 text-center">
          <Activity className="w-12 h-12 mx-auto text-gray-600" />
          <h2 className="mt-4 text-lg font-bold text-white">
            No Infrastructure Signals Found
          </h2>
          <p className="text-gray-400 mt-2 max-w-md mx-auto">
            This property doesn&apos;t have any nearby infrastructure projects
            that would affect its value. Check back later as new projects are
            added.
          </p>
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Insights
          </Link>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && (
        <>
          {/* Value Projection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative bg-gray-900 border border-gray-800 clip-notch p-6">
              <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Current Value
              </p>
              <p className="text-2xl font-bold text-white font-mono">
                {formatCurrency(analysis.currentValue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Assessed value</p>
            </div>

            <div className="relative bg-lime-400/10 border border-lime-400/30 clip-notch p-6">
              <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400/50" />
              <p className="text-xs text-lime-400 uppercase tracking-wider mb-2">
                Projected Value (3yr)
              </p>
              <p className="text-2xl font-bold text-lime-400 font-mono">
                {formatCurrency(analysis.projectedValue)}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />+
                {formatCurrency(
                  analysis.projectedValue - analysis.currentValue,
                )}{" "}
                increase
              </p>
            </div>

            <div className="relative bg-gray-900 border border-gray-800 clip-notch p-6">
              <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Confidence Score
              </p>
              <p className="text-2xl font-bold text-white font-mono">
                {analysis.confidence}%
              </p>
              <div className="flex gap-0.5 mt-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-1.5 rounded-sm ${
                      i < Math.round(analysis.confidence / 10)
                        ? analysis.signalStrength === "STRONG"
                          ? "bg-lime-400"
                          : analysis.signalStrength === "MODERATE"
                            ? "bg-yellow-400"
                            : "bg-orange-400"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Investment Analysis */}
          <div className="relative bg-gradient-to-r from-gray-900 to-gray-900/80 border border-gray-800 clip-notch p-6">
            <div className="absolute -top-px -left-px w-4 h-4 border-l-2 border-t-2 border-lime-400/50" />
            <div className="absolute -bottom-px -right-px w-4 h-4 border-r-2 border-b-2 border-lime-400/50" />

            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-lime-400" />
              Investment Analysis
            </h2>

            {/* Signal Strength */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-400">Signal Strength:</span>
                <div className="flex gap-0.5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-4 rounded-sm ${
                        i <
                        (analysis.signalStrength === "STRONG"
                          ? 10
                          : analysis.signalStrength === "MODERATE"
                            ? 7
                            : 4)
                          ? analysis.signalStrength === "STRONG"
                            ? "bg-lime-400"
                            : analysis.signalStrength === "MODERATE"
                              ? "bg-yellow-400"
                              : "bg-orange-400"
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`font-mono text-sm font-bold ${
                    analysis.signalStrength === "STRONG"
                      ? "text-lime-400"
                      : analysis.signalStrength === "MODERATE"
                        ? "text-yellow-400"
                        : "text-orange-400"
                  }`}
                >
                  {analysis.signalStrength}
                </span>
                <span className="text-xs text-gray-500">
                  ({analysis.avgCorrelation.toFixed(2)} correlation)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positive Factors */}
              {analysis.positiveFactors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-lime-400 flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    Positive Indicators
                  </h3>
                  <ul className="space-y-2">
                    {analysis.positiveFactors.map((factor, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <span className="text-lime-400 mt-0.5">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {analysis.riskFactors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-yellow-400 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Factors
                  </h3>
                  <ul className="space-y-2">
                    {analysis.riskFactors.map((factor, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                Based on {analysis.signalCount} infrastructure project
                {analysis.signalCount !== 1 ? "s" : ""} within impact radius,
                this property is projected to appreciate{" "}
                <span className="text-lime-400 font-mono">
                  +{analysis.projectedAppreciation}%
                </span>{" "}
                over the next{" "}
                <span className="text-white font-mono">
                  {analysis.avgLagYears} years
                </span>
                .
              </p>
            </div>
          </div>

          {/* Property Details + Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Details */}
            <div className="relative bg-gray-900 border border-gray-800 p-6 clip-notch">
              <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
              <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

              <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Property Details
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Parcel ID</dt>
                  <dd className="text-white font-mono text-sm">
                    {property.parcelId}
                  </dd>
                </div>
                {property.zoning && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Zoning</dt>
                    <dd className="text-white">{property.zoning}</dd>
                  </div>
                )}
                {property.landUse && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Land Use</dt>
                    <dd className="text-white">{property.landUse}</dd>
                  </div>
                )}
                {property.lotSizeSqft && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Lot Size</dt>
                    <dd className="text-white font-mono">
                      {(Number(property.lotSizeSqft) / 43560).toFixed(2)} acres
                    </dd>
                  </div>
                )}
                {property.lastSalePrice && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Last Sale Price</dt>
                    <dd className="text-lime-400 font-mono">
                      {formatCurrency(property.lastSalePrice)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="relative bg-gray-900 border border-gray-800 clip-notch overflow-hidden">
                <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700 z-10" />
                <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700 z-10" />

                <div className="p-4 border-b border-gray-800">
                  <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location & Infrastructure
                  </h2>
                </div>
                <MapView
                  markers={markers}
                  center={[property.longitude, property.latitude]}
                  zoom={12}
                  style={{ height: 250 }}
                  showBaseLayerSwitcher
                />
              </div>
            )}
          </div>

          {/* Infrastructure Signals */}
          <div className="relative bg-gray-900 border border-gray-800 p-6 clip-notch">
            <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
            <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Infrastructure Signals ({signals.length})
            </h2>

            <div className="space-y-3">
              {signals.map((signal) => (
                <Link
                  key={signal.id}
                  href={`/insights/${signal.id}`}
                  className="block p-4 bg-gray-800/50 border border-gray-700 clip-notch hover:border-lime-400/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`p-2 clip-notch shrink-0 ${
                          TYPE_COLORS[signal.type] ||
                          "text-gray-400 bg-gray-800"
                        }`}
                      >
                        {TYPE_ICONS[signal.type] || (
                          <Activity className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white group-hover:text-lime-400 transition-colors truncate">
                          {signal.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span
                            className={`px-1.5 py-0.5 border clip-notch ${
                              STATUS_BADGES[signal.status] ||
                              "text-gray-400 bg-gray-800 border-gray-700"
                            }`}
                          >
                            {signal.status}
                          </span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {signal.distance} mi away
                          </span>
                          {signal.year && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {signal.year}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      {signal.avgValueChange !== null && (
                        <div>
                          <p
                            className={`text-lg font-bold font-mono ${
                              signal.avgValueChange > 0
                                ? "text-lime-400"
                                : "text-red-400"
                            }`}
                          >
                            {signal.avgValueChange > 0 ? "+" : ""}
                            {signal.avgValueChange.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">impact</p>
                        </div>
                      )}
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-lime-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <Link
          href="/insights"
          className="px-4 py-2.5 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Insights
        </Link>

        {property.latitude && property.longitude && (
          <Link
            href={`/map?lat=${property.latitude}&lng=${property.longitude}&zoom=15`}
            className="px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch flex items-center gap-2 hover:bg-lime-300 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </Link>
        )}
      </div>
    </div>
  );
}
