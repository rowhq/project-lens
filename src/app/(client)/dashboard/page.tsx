"use client";

/**
 * Client Dashboard
 * Main dashboard for Lenders/Investors
 */

import { useMemo } from "react";
import Link from "next/link";
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import { AreaChart, DonutChart } from "@/shared/components/charts";

export default function ClientDashboard() {
  // Fetch more appraisals for weekly trends
  const { data: appraisals, isLoading } = trpc.appraisal.list.useQuery({ limit: 50 });
  const { data: orgStats } = trpc.organization.stats.useQuery();

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
    // Fallback to local computation
    return {
      total: appraisals?.items?.length || 0,
      inProgress: appraisals?.items?.filter(a =>
        ["DRAFT", "QUEUED", "RUNNING"].includes(a.status)
      ).length || 0,
      completed: appraisals?.items?.filter(a => a.status === "READY").length || 0,
      thisMonth: 0,
    };
  }, [orgStats, appraisals]);

  // Calculate weekly trend from actual appraisal data
  const weeklyTrendData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayData: Record<string, { appraisals: number }> = {};

    // Initialize all days
    days.forEach(day => {
      dayData[day] = { appraisals: 0 };
    });

    // Count appraisals by day of week (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    appraisals?.items?.forEach(appraisal => {
      const createdAt = new Date(appraisal.createdAt);
      if (createdAt >= thirtyDaysAgo) {
        const dayName = days[createdAt.getDay()];
        dayData[dayName].appraisals += 1;
      }
    });

    // Return in Mon-Sun order for display
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
      name: day,
      appraisals: dayData[day].appraisals,
    }));
  }, [appraisals]);

  // Calculate type distribution from actual data
  const typeDistributionData = useMemo(() => {
    const aiOnly = appraisals?.items?.filter(a => a.requestedType === "AI_REPORT").length || 0;
    const onSite = appraisals?.items?.filter(a => a.requestedType !== "AI_REPORT").length || 0;

    return [
      { name: "AI Only", value: aiOnly },
      { name: "On-Site", value: onSite },
    ];
  }, [appraisals]);

  return (
    <div className="space-y-6">
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

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={isLoading ? "..." : stats.total.toString()}
          icon={FileText}
          iconBg="bg-[var(--primary)]/10"
          iconColor="text-[var(--primary)]"
        />
        <StatCard
          title="In Progress"
          value={isLoading ? "..." : stats.inProgress.toString()}
          icon={Clock}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-500"
        />
        <StatCard
          title="Completed"
          value={isLoading ? "..." : stats.completed.toString()}
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
        />
        <StatCard
          title="This Month"
          value={isLoading ? "..." : stats.thisMonth.toString()}
          icon={AlertCircle}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <div className="col-span-2 bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--muted-foreground)]" />
            Weekly Activity
          </h2>
          <AreaChart
            data={weeklyTrendData}
            series={[
              { dataKey: "appraisals", name: "Appraisals", color: "#3B6CF3" },
            ]}
            height={220}
          />
        </div>

        {/* Type Distribution */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--muted-foreground)]" />
            Report Types
          </h2>
          <DonutChart
            data={typeDistributionData}
            height={220}
            showLegend
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Recent Appraisals
          </h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {isLoading ? (
            <div className="px-6 py-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--primary)]" />
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
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    appraisal.status === "READY"
                      ? "bg-green-500/20 text-green-400"
                      : appraisal.status === "RUNNING"
                      ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                      : appraisal.status === "FAILED"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}>
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
