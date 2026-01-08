"use client";

/**
 * Client Dashboard
 * Ledger-Inspired Design
 */

import { useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ArrowRight,
  DollarSign,
  Timer,
  Target,
  Edit3,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import dynamic from "next/dynamic";

// Lazy load charts for better initial page load
const AreaChart = dynamic(
  () => import("@/shared/components/charts").then((mod) => mod.AreaChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-[var(--secondary)] animate-pulse clip-notch" />
    ),
  },
);
const DonutChart = dynamic(
  () => import("@/shared/components/charts").then((mod) => mod.DonutChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-48 bg-[var(--secondary)] animate-pulse rounded-full mx-auto" />
    ),
  },
);
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { StatusBadge } from "@/shared/components/ui/StatusBadge";
import { StatCard, MetricCard } from "@/shared/components/ui/StatCard";
import { cn } from "@/shared/lib/utils";

export default function ClientDashboard() {
  // Fetch appraisals for analysis
  const { data: appraisals, isLoading } = trpc.appraisal.list.useQuery({
    limit: 50,
  });
  const { data: orgStats } = trpc.organization.stats.useQuery();

  // Calculate SLA warnings (appraisals that might be overdue or close to due)
  const slaWarnings = useMemo(() => {
    if (!appraisals?.items) return [];

    const now = new Date();
    const warnings: Array<{
      id: string;
      address: string;
      status: string;
      hoursRemaining: number;
      isOverdue: boolean;
    }> = [];

    appraisals.items.forEach((appraisal) => {
      if (!["QUEUED", "RUNNING"].includes(appraisal.status)) return;

      const createdAt = new Date(appraisal.createdAt);
      const expectedHours = appraisal.requestedType === "AI_REPORT" ? 1 : 48;
      const expectedCompletion = new Date(
        createdAt.getTime() + expectedHours * 60 * 60 * 1000,
      );
      const hoursRemaining =
        (expectedCompletion.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursRemaining < 6) {
        warnings.push({
          id: appraisal.id,
          address: appraisal.property.addressLine1,
          status: appraisal.status,
          hoursRemaining: Math.max(0, hoursRemaining),
          isOverdue: hoursRemaining < 0,
        });
      }
    });

    return warnings.sort((a, b) => a.hoursRemaining - b.hoursRemaining);
  }, [appraisals]);

  // Find drafts that need completion
  const drafts = useMemo(() => {
    return appraisals?.items?.filter((a) => a.status === "DRAFT") || [];
  }, [appraisals]);

  // Calculate advanced stats
  const advancedStats = useMemo(() => {
    const items = appraisals?.items || [];
    const completed = items.filter((a) => a.status === "READY");
    const failed = items.filter((a) => a.status === "FAILED");

    let avgCompletionHours = 0;
    if (completed.length > 0) {
      const totalHours = completed.reduce((sum, a) => {
        const created = new Date(a.createdAt);
        const updated = new Date(a.updatedAt);
        return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgCompletionHours = totalHours / completed.length;
    }

    const totalProcessed = completed.length + failed.length;
    const successRate =
      totalProcessed > 0 ? (completed.length / totalProcessed) * 100 : 100;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthlySpend = items
      .filter((a) => new Date(a.createdAt) >= thisMonth)
      .reduce((sum, a) => sum + Number(a.price || 0), 0);

    return {
      avgCompletionHours,
      successRate,
      monthlySpend,
      completedThisMonth: items.filter(
        (a) => a.status === "READY" && new Date(a.createdAt) >= thisMonth,
      ).length,
    };
  }, [appraisals]);

  // Use org stats when available
  const stats = useMemo(() => {
    if (orgStats) {
      return {
        total: orgStats.totalAppraisals,
        inProgress: orgStats.activeJobs,
        completed: orgStats.completedJobs,
        thisMonth: orgStats.monthlyAppraisals,
      };
    }
    return {
      total: appraisals?.items?.length || 0,
      inProgress:
        appraisals?.items?.filter((a) =>
          ["DRAFT", "QUEUED", "RUNNING"].includes(a.status),
        ).length || 0,
      completed:
        appraisals?.items?.filter((a) => a.status === "READY").length || 0,
      thisMonth: 0,
    };
  }, [orgStats, appraisals]);

  // Weekly trend data
  const weeklyTrendData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayData: Record<string, { appraisals: number }> = {};

    days.forEach((day) => {
      dayData[day] = { appraisals: 0 };
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    appraisals?.items?.forEach((appraisal) => {
      const createdAt = new Date(appraisal.createdAt);
      if (createdAt >= thirtyDaysAgo) {
        const dayName = days[createdAt.getDay()];
        dayData[dayName].appraisals += 1;
      }
    });

    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      name: day,
      appraisals: dayData[day].appraisals,
    }));
  }, [appraisals]);

  // Type distribution data
  const typeDistributionData = useMemo(() => {
    const aiOnly =
      appraisals?.items?.filter((a) => a.requestedType === "AI_REPORT")
        .length || 0;
    const onSite =
      appraisals?.items?.filter((a) => a.requestedType !== "AI_REPORT")
        .length || 0;

    return [
      { name: "AI Only", value: aiOnly },
      { name: "On-Site", value: onSite },
    ];
  }, [appraisals]);

  return (
    <div className="space-y-6">
      {/* SLA Warning Banner */}
      {slaWarnings.length > 0 && (
        <div className="relative bg-orange-500/5 border border-orange-500/20 p-4 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-orange-500" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-orange-500" />
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-mono text-label uppercase tracking-wider text-orange-400">
                {slaWarnings.length} APPRAISAL
                {slaWarnings.length > 1 ? "S" : ""} NEED ATTENTION
              </h3>
              <div className="mt-3 space-y-2">
                {slaWarnings.slice(0, 3).map((warning) => (
                  <Link
                    key={warning.id}
                    href={`/appraisals/${warning.id}`}
                    className="flex items-center justify-between text-sm text-[var(--foreground)] hover:text-white transition-colors"
                  >
                    <span className="truncate max-w-[200px]">
                      {warning.address}
                    </span>
                    <span className="flex items-center gap-1 ml-2 font-mono text-label">
                      {warning.isOverdue ? (
                        <span className="text-red-400">OVERDUE</span>
                      ) : (
                        <>
                          <Timer className="w-3 h-3" />
                          {warning.hoursRemaining.toFixed(1)}H
                        </>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Continuation Banner */}
      {drafts.length > 0 && (
        <div className="relative bg-blue-500/5 border border-blue-500/20 p-4 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-blue-500" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-blue-500" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-mono text-label uppercase tracking-wider text-blue-400">
                  {drafts.length} INCOMPLETE DRAFT{drafts.length > 1 ? "S" : ""}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Complete payment to start processing
                </p>
              </div>
            </div>
            <Link
              href={`/appraisals/${drafts[0].id}`}
              className={cn(
                "px-4 py-2.5",
                "bg-blue-500 text-white",
                "font-mono text-label uppercase tracking-wider",
                "clip-notch",
                "hover:bg-blue-400 transition-colors",
                "flex items-center gap-2",
              )}
            >
              CONTINUE
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-body-sm text-[var(--muted-foreground)]">
            Welcome back. Here&apos;s an overview of your appraisal activity.
          </p>
        </div>
        <Link
          href="/appraisals/new"
          className={cn(
            "inline-flex items-center gap-2",
            "px-4 py-2.5",
            "bg-lime-400 text-black",
            "font-mono text-sm font-semibold uppercase tracking-wider",
            "clip-notch",
            "hover:bg-lime-300 transition-colors",
          )}
        >
          <Plus className="h-4 w-4" />
          RUN APPRAISAL
        </Link>
      </div>

      {/* Primary Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[var(--card)] border border-[var(--border)] p-6 clip-notch"
            >
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="TOTAL REPORTS"
            value={stats.total}
            icon={FileText}
            accentColor="lime"
          />
          <StatCard
            label="IN PROGRESS"
            value={stats.inProgress}
            icon={Clock}
            accentColor="yellow"
          />
          <StatCard
            label="COMPLETED"
            value={stats.completed}
            icon={CheckCircle}
            accentColor="green"
          />
          <StatCard
            label="THIS MONTH"
            value={advancedStats.completedThisMonth}
            icon={TrendingUp}
            accentColor="blue"
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            icon={Timer}
            label="AVG COMPLETION"
            value={
              advancedStats.avgCompletionHours < 1
                ? `${Math.round(advancedStats.avgCompletionHours * 60)}m`
                : `${advancedStats.avgCompletionHours.toFixed(1)}h`
            }
            accentColor="cyan"
          />
          <MetricCard
            icon={Target}
            label="SUCCESS RATE"
            value={`${advancedStats.successRate.toFixed(0)}%`}
            accentColor="lime"
          />
          <MetricCard
            icon={DollarSign}
            label="SPENT THIS MONTH"
            value={`$${advancedStats.monthlySpend.toLocaleString()}`}
            accentColor="emerald"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] p-6 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-[var(--border)]" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-[var(--border)]" />
          <h2 className="font-mono text-label uppercase tracking-wider text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            WEEKLY ACTIVITY
          </h2>
          <AreaChart
            data={weeklyTrendData}
            series={[
              { dataKey: "appraisals", name: "Appraisals", color: "#4ADE80" },
            ]}
            height={220}
          />
        </div>

        {/* Type Distribution */}
        <div className="relative bg-[var(--card)] border border-[var(--border)] p-6 clip-notch">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-[var(--border)]" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-[var(--border)]" />
          <h2 className="font-mono text-label uppercase tracking-wider text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            REPORT TYPES
          </h2>
          <DonutChart data={typeDistributionData} height={220} showLegend />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="relative bg-[var(--card)] border border-[var(--border)] clip-notch">
        <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400" />
        <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-lime-400" />

        <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="font-mono text-label uppercase tracking-wider text-[var(--muted-foreground)]">
            RECENT APPRAISALS
          </h2>
          <Link
            href="/appraisals"
            className="text-sm text-lime-400 hover:text-lime-300 flex items-center gap-1 font-mono uppercase tracking-wider"
          >
            VIEW ALL
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]/50">
          {isLoading ? (
            <div className="px-6 py-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : appraisals?.items?.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-[var(--muted)]" />
              <p className="mt-4 text-[var(--muted-foreground)]">
                No appraisals yet
              </p>
              <Link
                href="/appraisals/new"
                className="mt-4 inline-flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300 font-mono uppercase tracking-wider"
              >
                RUN YOUR FIRST APPRAISAL
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            appraisals?.items?.slice(0, 5).map((appraisal) => (
              <Link
                key={appraisal.id}
                href={`/appraisals/${appraisal.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[var(--secondary)]/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-white">
                    {appraisal.property.addressLine1}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {appraisal.property.city}, {appraisal.property.state}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={appraisal.status} />
                  <p className="mt-1 text-sm text-[var(--muted-foreground)] font-mono">
                    {new Date(appraisal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
