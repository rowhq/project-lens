"use client";

import { use, useMemo, useRef } from "react";
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
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  FileText,
  Home,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Download,
  Users,
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
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const {
    data: insight,
    isLoading,
    error,
  } = trpc.insights.getInsightById.useQuery({
    id: resolvedParams.id,
  });

  // Get similar insights
  const { data: similarInsights } = trpc.insights.getSimilarInsights.useQuery(
    { id: resolvedParams.id, limit: 3 },
    { enabled: !!resolvedParams.id },
  );

  // Get adjacent insights for navigation
  const { data: adjacentInsights } = trpc.insights.getAdjacentInsights.useQuery(
    { id: resolvedParams.id },
    { enabled: !!resolvedParams.id },
  );

  // Get affected properties
  const { data: affectedProperties } =
    trpc.insights.getAffectedProperties.useQuery(
      { insightId: resolvedParams.id, limit: 5 },
      { enabled: !!resolvedParams.id },
    );

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

  // Generate investment analysis based on data
  const investmentAnalysis = useMemo(() => {
    if (!insight) return null;

    // Signal strength based on correlation
    const correlation = insight.correlation ?? 0;
    let signalStrength: "STRONG" | "MODERATE" | "WEAK" = "WEAK";
    let signalColor = "text-gray-400";
    let signalBars = 3;

    if (correlation >= 0.7) {
      signalStrength = "STRONG";
      signalColor = "text-lime-400";
      signalBars = 10;
    } else if (correlation >= 0.5) {
      signalStrength = "MODERATE";
      signalColor = "text-yellow-400";
      signalBars = 7;
    } else if (correlation >= 0.3) {
      signalStrength = "WEAK";
      signalColor = "text-orange-400";
      signalBars = 4;
    }

    // Risk factors
    const riskFactors: string[] = [];
    if (insight.status === "PENDING") {
      riskFactors.push("Project still in pending status - timeline uncertain");
    }
    if (insight.status === "CANCELLED") {
      riskFactors.push("Project has been cancelled");
    }
    if (insight.lagPeriodYears && insight.lagPeriodYears > 3) {
      riskFactors.push(
        `Long appreciation lag of ${insight.lagPeriodYears.toFixed(1)} years`,
      );
    }
    if (correlation < 0.5) {
      riskFactors.push("Lower correlation with historical appreciation data");
    }

    // Positive factors
    const positiveFactors: string[] = [];
    if (insight.avgValueChange && insight.avgValueChange > 15) {
      positiveFactors.push(
        `Strong historical appreciation of +${insight.avgValueChange.toFixed(1)}%`,
      );
    } else if (insight.avgValueChange && insight.avgValueChange > 0) {
      positiveFactors.push(
        `Positive value impact of +${insight.avgValueChange.toFixed(1)}%`,
      );
    }
    if (insight.status === "COMPLETED") {
      positiveFactors.push(
        "Project completed - appreciation may be materializing",
      );
    }
    if (insight.status === "ACTIVE") {
      positiveFactors.push("Project actively in progress");
    }
    if (correlation >= 0.7) {
      positiveFactors.push(
        "Strong correlation with historical property appreciation",
      );
    }
    if (insight.parcelsAffected && insight.parcelsAffected > 500) {
      positiveFactors.push(
        `Large impact zone with ${insight.parcelsAffected.toLocaleString()} properties`,
      );
    }

    return {
      signalStrength,
      signalColor,
      signalBars,
      riskFactors,
      positiveFactors,
      correlation,
    };
  }, [insight]);

  // Calculate comparison with similar projects
  const comparisonAnalysis = useMemo(() => {
    if (!insight || !similarInsights || similarInsights.length === 0)
      return null;

    const avgValueChange =
      similarInsights
        .filter((s) => s.avgValueChange !== null)
        .reduce((sum, s) => sum + (s.avgValueChange || 0), 0) /
      Math.max(
        similarInsights.filter((s) => s.avgValueChange !== null).length,
        1,
      );

    const avgCorrelation =
      similarInsights
        .filter((s) => s.correlation !== null)
        .reduce((sum, s) => sum + (s.correlation || 0), 0) /
      Math.max(similarInsights.filter((s) => s.correlation !== null).length, 1);

    const avgLag =
      similarInsights
        .filter((s) => s.lagPeriodYears !== null)
        .reduce((sum, s) => sum + (s.lagPeriodYears || 0), 0) /
      Math.max(
        similarInsights.filter((s) => s.lagPeriodYears !== null).length,
        1,
      );

    const avgParcels =
      similarInsights
        .filter((s) => s.parcelsAffected !== null)
        .reduce((sum, s) => sum + (s.parcelsAffected || 0), 0) /
      Math.max(
        similarInsights.filter((s) => s.parcelsAffected !== null).length,
        1,
      );

    return {
      valueChange: {
        this: insight.avgValueChange,
        avg: avgValueChange,
        diff: (insight.avgValueChange || 0) - avgValueChange,
        better: (insight.avgValueChange || 0) > avgValueChange,
      },
      correlation: {
        this: insight.correlation,
        avg: avgCorrelation,
        diff: (insight.correlation || 0) - avgCorrelation,
        better: (insight.correlation || 0) > avgCorrelation,
      },
      lag: {
        this: insight.lagPeriodYears,
        avg: avgLag,
        diff: (insight.lagPeriodYears || 0) - avgLag,
        better: (insight.lagPeriodYears || 0) < avgLag, // Lower lag is better
      },
      parcels: {
        this: insight.parcelsAffected,
        avg: avgParcels,
        diff: (insight.parcelsAffected || 0) - avgParcels,
        better: (insight.parcelsAffected || 0) > avgParcels,
      },
    };
  }, [insight, similarInsights]);

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
          <div className="flex gap-2 flex-wrap">
            {/* Primary CTA - Go to full map page */}
            <Link
              href={`/map?lat=${insight.latitude}&lng=${insight.longitude}&zoom=13`}
              className="px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch flex items-center gap-2 hover:bg-lime-300 transition-colors"
            >
              <Target className="w-4 h-4" />
              Explore Zone
            </Link>
            {/* Secondary - Scroll to local map on this page */}
            <button
              onClick={() => {
                mapSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="px-4 py-2 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              View Location
            </button>
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

      {/* Investment Analysis Section */}
      {investmentAnalysis && (
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-900/80 border border-gray-800 clip-notch p-6">
          {/* L-Bracket Corners */}
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
                      i < investmentAnalysis.signalBars
                        ? investmentAnalysis.signalStrength === "STRONG"
                          ? "bg-lime-400"
                          : investmentAnalysis.signalStrength === "MODERATE"
                            ? "bg-yellow-400"
                            : "bg-orange-400"
                        : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <span
                className={`font-mono text-sm font-bold ${investmentAnalysis.signalColor}`}
              >
                {investmentAnalysis.signalStrength}
              </span>
              <span className="text-xs text-gray-500">
                ({investmentAnalysis.correlation.toFixed(2)} correlation)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Factors */}
            {investmentAnalysis.positiveFactors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-lime-400 flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4" />
                  Positive Indicators
                </h3>
                <ul className="space-y-2">
                  {investmentAnalysis.positiveFactors.map((factor, index) => (
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
            {investmentAnalysis.riskFactors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-yellow-400 flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Factors
                </h3>
                <ul className="space-y-2">
                  {investmentAnalysis.riskFactors.map((factor, index) => (
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

          {/* Key Takeaway */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              {insight.avgValueChange && insight.lagPeriodYears ? (
                <>
                  Based on historical data, properties near this{" "}
                  {typeConfig.label.toLowerCase()} typically see{" "}
                  <span className="text-lime-400 font-mono">
                    +{insight.avgValueChange.toFixed(1)}%
                  </span>{" "}
                  appreciation within{" "}
                  <span className="text-white font-mono">
                    {insight.lagPeriodYears.toFixed(1)} years
                  </span>{" "}
                  of project completion.
                </>
              ) : (
                <>
                  This project is being tracked for potential property value
                  impact. Check back for updated analysis as more data becomes
                  available.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* How This Project Compares */}
      {comparisonAnalysis && (
        <div className="relative bg-gray-900 border border-gray-800 clip-notch p-6">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            How This Project Compares
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Compared to {similarInsights?.length || 0} similar{" "}
            {typeConfig.label.toLowerCase()} projects
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-2 px-3 text-left text-xs font-mono uppercase text-gray-500">
                    Metric
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-mono uppercase text-gray-500">
                    This Project
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-mono uppercase text-gray-500">
                    Similar Avg
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-mono uppercase text-gray-500">
                    Difference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                <tr>
                  <td className="py-2 px-3 text-gray-400">Value Change</td>
                  <td className="py-2 px-3 text-right font-mono text-white">
                    {comparisonAnalysis.valueChange.this !== null
                      ? `${comparisonAnalysis.valueChange.this > 0 ? "+" : ""}${comparisonAnalysis.valueChange.this.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">
                    {comparisonAnalysis.valueChange.avg > 0 ? "+" : ""}
                    {comparisonAnalysis.valueChange.avg.toFixed(1)}%
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono flex items-center justify-end gap-1 ${
                      comparisonAnalysis.valueChange.better
                        ? "text-lime-400"
                        : "text-red-400"
                    }`}
                  >
                    {comparisonAnalysis.valueChange.diff > 0 ? "+" : ""}
                    {comparisonAnalysis.valueChange.diff.toFixed(1)}%
                    {comparisonAnalysis.valueChange.better ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-400">Correlation</td>
                  <td className="py-2 px-3 text-right font-mono text-white">
                    {comparisonAnalysis.correlation.this?.toFixed(2) ?? "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">
                    {comparisonAnalysis.correlation.avg.toFixed(2)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono flex items-center justify-end gap-1 ${
                      comparisonAnalysis.correlation.better
                        ? "text-lime-400"
                        : "text-red-400"
                    }`}
                  >
                    {comparisonAnalysis.correlation.diff > 0 ? "+" : ""}
                    {comparisonAnalysis.correlation.diff.toFixed(2)}
                    {comparisonAnalysis.correlation.better ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-400">Lag Period</td>
                  <td className="py-2 px-3 text-right font-mono text-white">
                    {comparisonAnalysis.lag.this !== null
                      ? `${comparisonAnalysis.lag.this.toFixed(1)} yrs`
                      : "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">
                    {comparisonAnalysis.lag.avg.toFixed(1)} yrs
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono flex items-center justify-end gap-1 ${
                      comparisonAnalysis.lag.better
                        ? "text-lime-400"
                        : "text-red-400"
                    }`}
                  >
                    {comparisonAnalysis.lag.diff > 0 ? "+" : ""}
                    {comparisonAnalysis.lag.diff.toFixed(1)} yrs
                    {comparisonAnalysis.lag.better ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-400">Parcels Affected</td>
                  <td className="py-2 px-3 text-right font-mono text-white">
                    {comparisonAnalysis.parcels.this?.toLocaleString() ?? "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-gray-400">
                    {Math.round(
                      comparisonAnalysis.parcels.avg,
                    ).toLocaleString()}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-mono flex items-center justify-end gap-1 ${
                      comparisonAnalysis.parcels.better
                        ? "text-lime-400"
                        : "text-red-400"
                    }`}
                  >
                    {comparisonAnalysis.parcels.diff > 0 ? "+" : ""}
                    {Math.round(
                      comparisonAnalysis.parcels.diff,
                    ).toLocaleString()}
                    {comparisonAnalysis.parcels.better ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        <div
          ref={mapSectionRef}
          className="relative bg-gray-900 border border-gray-800 clip-notch overflow-hidden"
        >
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

      {/* Affected Properties */}
      {affectedProperties && affectedProperties.stats.totalCount > 0 && (
        <div className="relative bg-gray-900 border border-gray-800 p-6 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Affected Properties (
            {affectedProperties.stats.totalCount.toLocaleString()} parcels)
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Properties within {insight.impactRadiusMiles || 5} miles of this
            project
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="text-2xl font-bold text-lime-400 font-mono">
                {formatCurrency(affectedProperties.stats.totalAssessedValue)}
              </p>
              <p className="text-xs text-gray-500">Total Assessed Value</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="text-2xl font-bold text-white font-mono">
                {affectedProperties.stats.totalCount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Parcels</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="text-2xl font-bold text-white font-mono">
                {affectedProperties.stats.avgLotSizeSqft > 0
                  ? `${(affectedProperties.stats.avgLotSizeSqft / 43560).toFixed(2)} ac`
                  : "—"}
              </p>
              <p className="text-xs text-gray-500">Avg Lot Size</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded">
              <p className="text-lg font-bold text-white font-mono truncate">
                {affectedProperties.stats.zoningBreakdown[0]?.zoning || "—"}
              </p>
              <p className="text-xs text-gray-500">
                Top Zoning (
                {affectedProperties.stats.zoningBreakdown[0]?.percentage.toFixed(
                  0,
                )}
                %)
              </p>
            </div>
          </div>

          {/* Sample Properties */}
          {affectedProperties.properties.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="text-xs font-mono uppercase text-gray-500">
                Sample Properties
              </h3>
              <div className="space-y-2">
                {affectedProperties.properties.map((property) => (
                  <div
                    key={property.parcelId}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-white truncate">
                          {property.addressLine1 || property.parcelId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {property.city}, {property.state} {property.zipCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-lime-400 font-mono">
                        {formatCurrency(property.assessedValue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {property.zoning || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <Link
              href={`/map?lat=${insight.latitude}&lng=${insight.longitude}&zoom=13`}
              className="flex-1 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch flex items-center justify-center gap-2 hover:bg-lime-300 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Explore on Map
            </Link>
            <button
              onClick={() => {
                // Export properties as CSV
                const csv = [
                  "Address,City,State,Zip,Assessed Value,Zoning",
                  ...affectedProperties.properties.map((p) =>
                    [
                      p.addressLine1 || p.parcelId,
                      p.city,
                      p.state,
                      p.zipCode,
                      p.assessedValue,
                      p.zoning,
                    ].join(","),
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `affected-properties-${insight.id}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2.5 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 hover:border-lime-400/50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Similar Projects */}
      {similarInsights && similarInsights.length > 0 && (
        <div className="relative bg-gray-900 border border-gray-800 p-6 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Similar Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {similarInsights.map((similar) => {
              const similarTypeConfig =
                TYPE_CONFIG[similar.type as InsightType] ||
                TYPE_CONFIG.INFRASTRUCTURE;
              return (
                <Link
                  key={similar.id}
                  href={`/insights/${similar.id}`}
                  className="p-4 bg-gray-800/50 border border-gray-700 clip-notch hover:border-lime-400/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 ${similarTypeConfig.bgColor} clip-notch shrink-0`}
                    >
                      <span className={similarTypeConfig.color}>
                        {similarTypeConfig.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate group-hover:text-lime-400 transition-colors">
                        {similar.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {similar.city || similar.county}, {similar.state}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {similar.avgValueChange !== null && (
                          <span
                            className={`text-xs font-mono ${
                              similar.avgValueChange > 0
                                ? "text-lime-400"
                                : "text-red-400"
                            }`}
                          >
                            {similar.avgValueChange > 0 ? "+" : ""}
                            {similar.avgValueChange.toFixed(1)}%
                          </span>
                        )}
                        {similar.projectYear && (
                          <span className="text-xs text-gray-500 font-mono">
                            {similar.projectYear}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        {/* Previous Button */}
        {adjacentInsights?.prev ? (
          <Link
            href={`/insights/${adjacentInsights.prev.id}`}
            className="px-4 py-2.5 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2 group max-w-[40%]"
          >
            <ChevronLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className="truncate hidden sm:inline">
              {adjacentInsights.prev.title}
            </span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <Link
            href="/insights"
            className="px-4 py-2.5 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Insights
          </Link>
        )}

        {/* Center - Back to list */}
        <Link
          href="/insights"
          className="text-xs text-gray-500 hover:text-lime-400 transition-colors hidden md:block"
        >
          View all insights
        </Link>

        {/* Next Button */}
        {adjacentInsights?.next ? (
          <Link
            href={`/insights/${adjacentInsights.next.id}`}
            className="px-4 py-2.5 border border-gray-700 clip-notch text-gray-300 font-mono text-sm uppercase tracking-wider hover:bg-gray-800 hover:border-lime-400/50 transition-colors flex items-center gap-2 group max-w-[40%]"
          >
            <span className="truncate hidden sm:inline">
              {adjacentInsights.next.title}
            </span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div className="w-24" /> /* Spacer when no next */
        )}
      </div>
    </div>
  );
}
