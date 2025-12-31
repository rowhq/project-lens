"use client";

/**
 * Client Dashboard
 * Main dashboard for Lenders/Investors
 * Actionable with SLA warnings, draft CTAs, and useful metrics
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
import { AreaChart, DonutChart } from "@/shared/components/charts";
import { Skeleton, SkeletonStats } from "@/shared/components/ui/Skeleton";

export default function ClientDashboard() {
  // Fetch appraisals for analysis
  const { data: appraisals, isLoading } = trpc.appraisal.list.useQuery({ limit: 50 });
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
      // Only check non-completed appraisals
      if (!["QUEUED", "RUNNING"].includes(appraisal.status)) return;

      // Calculate expected completion based on type
      const createdAt = new Date(appraisal.createdAt);
      const expectedHours = appraisal.requestedType === "AI_REPORT" ? 1 : 48;
      const expectedCompletion = new Date(createdAt.getTime() + expectedHours * 60 * 60 * 1000);
      const hoursRemaining = (expectedCompletion.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Warn if less than 6 hours remaining or overdue
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

    // Average completion time (for completed appraisals)
    let avgCompletionHours = 0;
    if (completed.length > 0) {
      const totalHours = completed.reduce((sum, a) => {
        const created = new Date(a.createdAt);
        const updated = new Date(a.updatedAt);
        return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgCompletionHours = totalHours / completed.length;
    }

    // Success rate
    const totalProcessed = completed.length + failed.length;
    const successRate = totalProcessed > 0 ? (completed.length / totalProcessed) * 100 : 100;

    // Total spent this month
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
        (a) => a.status === "READY" && new Date(a.createdAt) >= thisMonth
      ).length,
    };
  }, [appraisals]);

  // Use org stats when available, fallback to computed stats
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
        appraisals?.items?.filter((a) => ["DRAFT", "QUEUED", "RUNNING"].includes(a.status))
          .length || 0,
      completed: appraisals?.items?.filter((a) => a.status === "READY").length || 0,
      thisMonth: 0,
    };
  }, [orgStats, appraisals]);

  // Calculate weekly trend from actual appraisal data
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

  // Calculate type distribution from actual data
  const typeDistributionData = useMemo(() => {
    const aiOnly = appraisals?.items?.filter((a) => a.requestedType === "AI_REPORT").length || 0;
    const onSite = appraisals?.items?.filter((a) => a.requestedType !== "AI_REPORT").length || 0;

    return [
      { name: "AI Only", value: aiOnly },
      { name: "On-Site", value: onSite },
    ];
  }, [appraisals]);

  return (
    <div className="space-y-6">
      {/* SLA Warning Banner */}
      {slaWarnings.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-400">
                {slaWarnings.length} appraisal{slaWarnings.length > 1 ? "s" : ""} need attention
              </h3>
              <div className="mt-2 space-y-1">
                {slaWarnings.slice(0, 3).map((warning) => (
                  <Link
                    key={warning.id}
                    href={`/appraisals/${warning.id}`}
                    className="flex items-center justify-between text-sm text-orange-300 hover:text-orange-200"
                  >
                    <span className="truncate max-w-[200px]">{warning.address}</span>
                    <span className="flex items-center gap-1 ml-2">
                      {warning.isOverdue ? (
                        <span className="text-red-400">Overdue</span>
                      ) : (
                        <>
                          <Timer className="w-3 h-3" />
                          {warning.hoursRemaining.toFixed(1)}h remaining
                        </>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
              {slaWarnings.length > 3 && (
                <Link
                  href="/appraisals?status=RUNNING"
                  className="mt-2 inline-flex items-center text-sm text-orange-400 hover:text-orange-300"
                >
                  View all {slaWarnings.length} →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Draft Continuation Banner */}
      {drafts.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-400">
                  {drafts.length} incomplete draft{drafts.length > 1 ? "s" : ""}
                </h3>
                <p className="text-sm text-blue-300/70">
                  Complete payment to start processing
                </p>
              </div>
            </div>
            <Link
              href={`/appraisals/${drafts[0].id}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center gap-2"
            >
              Continue Draft
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Welcome back. Here&apos;s an overview of your appraisal activity.
          </p>
        </div>
        <Link
          href="/appraisals/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Run Appraisal
        </Link>
      </div>

      {/* Primary Stats */}
      {isLoading ? (
        <SkeletonStats count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Reports"
            value={stats.total.toString()}
            icon={FileText}
            iconBg="bg-[var(--primary)]/10"
            iconColor="text-[var(--primary)]"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress.toString()}
            icon={Clock}
            iconBg="bg-yellow-500/10"
            iconColor="text-yellow-500"
          />
          <StatCard
            title="Completed"
            value={stats.completed.toString()}
            icon={CheckCircle}
            iconBg="bg-green-500/10"
            iconColor="text-green-500"
          />
          <StatCard
            title="This Month"
            value={advancedStats.completedThisMonth.toString()}
            icon={TrendingUp}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-500"
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-cyan-500/10">
                <Timer className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Avg Completion</p>
                <p className="text-xl font-bold text-[var(--foreground)]">
                  {advancedStats.avgCompletionHours < 1
                    ? `${Math.round(advancedStats.avgCompletionHours * 60)}m`
                    : `${advancedStats.avgCompletionHours.toFixed(1)}h`}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Success Rate</p>
                <p className="text-xl font-bold text-[var(--foreground)]">
                  {advancedStats.successRate.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2 bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Spent This Month</p>
                <p className="text-xl font-bold text-[var(--foreground)]">
                  ${advancedStats.monthlySpend.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--muted-foreground)]" />
            Weekly Activity
          </h2>
          <AreaChart
            data={weeklyTrendData}
            series={[{ dataKey: "appraisals", name: "Appraisals", color: "#3B6CF3" }]}
            height={220}
          />
        </div>

        {/* Type Distribution */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--muted-foreground)]" />
            Report Types
          </h2>
          <DonutChart data={typeDistributionData} height={220} showLegend />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Appraisals</h2>
          <Link
            href="/appraisals"
            className="text-sm text-[var(--primary)] hover:opacity-80 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {isLoading ? (
            <div className="px-6 py-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : appraisals?.items?.length === 0 ? (
            <div className="px-6 py-8 text-center text-[var(--muted-foreground)]">
              <FileText className="mx-auto h-12 w-12 text-[var(--muted)]" />
              <p className="mt-2">No appraisals yet</p>
              <Link
                href="/appraisals/new"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:opacity-80"
              >
                Run your first appraisal
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ) : (
            appraisals?.items?.slice(0, 5).map((appraisal) => (
              <Link
                key={appraisal.id}
                href={`/appraisals/${appraisal.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[var(--secondary)]"
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {appraisal.property.addressLine1}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {appraisal.property.city}, {appraisal.property.state}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      appraisal.status === "READY"
                        ? "bg-green-500/20 text-green-400"
                        : appraisal.status === "RUNNING"
                        ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                        : appraisal.status === "FAILED"
                        ? "bg-red-500/20 text-red-400"
                        : appraisal.status === "DRAFT"
                        ? "bg-gray-500/20 text-gray-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {appraisal.status}
                  </span>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
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

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
        </div>
      </div>
    </div>
  );
}
