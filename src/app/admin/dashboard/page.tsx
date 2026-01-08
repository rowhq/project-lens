"use client";

import { useState, memo } from "react";
import { trpc } from "@/shared/lib/trpc";
import {
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Briefcase,
  Building,
  UserCheck,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { AreaChart, DonutChart } from "@/shared/components/charts";
import { cn } from "@/shared/lib/utils";

type DateRange = "7d" | "30d" | "90d" | "ytd";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// Stat Card Component - Ledger Style
const StatCard = memo(function StatCard({
  label,
  value,
  subtext,
  change,
  trend,
  icon: Icon,
  accentColor = "lime",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  trend?: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "lime" | "amber" | "red" | "purple";
}) {
  const colorClasses = {
    lime: "text-lime-400 bg-lime-400/10 border-lime-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  };

  return (
    <div className="relative bg-gray-950 border border-gray-800 p-5 clip-notch group hover:border-gray-700 transition-colors duration-fast">
      {/* Bracket corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "p-2.5 border clip-notch-sm",
            colorClasses[accentColor],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && change && (
          <span
            className={cn(
              "flex items-center gap-1 text-label font-mono",
              trend === "up" ? "text-lime-400" : "text-red-400",
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-label text-gray-500 font-mono uppercase tracking-wider mt-1">
        {subtext || label}
      </p>
    </div>
  );
});

// SLA Status Item
const SLAStatusItem = memo(function SLAStatusItem({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "lime" | "amber" | "red";
}) {
  const colorClasses = {
    lime: "bg-lime-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span
          className={cn("w-2 h-2", colorClasses[color])}
          style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
        />
        <span className="text-gray-300 text-sm">{label}</span>
      </div>
      <span className="font-mono font-bold text-white">{count}</span>
    </div>
  );
});

// Quick Action Button
const QuickActionCard = memo(function QuickActionCard({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative bg-gray-950 border border-gray-800 p-4",
        "clip-notch-sm",
        "flex items-center gap-3",
        "hover:border-lime-400/50 hover:bg-gray-900",
        "transition-all duration-fast group",
      )}
    >
      <div className="p-2 bg-gray-900 border border-gray-800 clip-notch-sm group-hover:border-lime-400/30 transition-colors">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-lime-400 transition-colors" />
      </div>
      <span className="font-mono text-sm uppercase tracking-wider text-gray-300 group-hover:text-white transition-colors">
        {label}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-lime-400 transition-colors" />
    </Link>
  );
});

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7d");

  const { data: stats } = trpc.admin.dashboard.stats.useQuery({ dateRange });
  const { data: activity } = trpc.admin.dashboard.recentActivity.useQuery();
  const { data: weeklyTrend } = trpc.admin.dashboard.weeklyTrend.useQuery({
    dateRange,
  });
  const { data: jobTypeData } =
    trpc.admin.dashboard.jobTypeDistribution.useQuery({ dateRange });

  const dateRangeLabels: Record<DateRange, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    ytd: "Year to date",
  };

  const metrics = [
    {
      label: "Total Revenue",
      value: `$${stats?.revenue?.period?.toLocaleString() || "0"}`,
      icon: DollarSign,
      accentColor: "lime" as const,
    },
    {
      label: "Active Jobs",
      value: stats?.jobs?.active || 0,
      subtext: `${stats?.jobs?.completed || 0} completed`,
      icon: Briefcase,
      accentColor: "amber" as const,
    },
    {
      label: "Appraisers",
      value: stats?.appraisers?.total || 0,
      subtext: `${stats?.appraisers?.verified || 0} verified`,
      icon: UserCheck,
      accentColor: "purple" as const,
    },
    {
      label: "Organizations",
      value: stats?.organizations || 0,
      subtext: `${stats?.appraisals?.period || 0} requests`,
      icon: Building,
      accentColor: "lime" as const,
    },
  ];

  const slaStatus = [
    {
      label: "On Track",
      count: (stats?.jobs?.active || 0) - (stats?.jobs?.slaBreach || 0),
      color: "lime" as const,
    },
    { label: "At Risk", count: 0, color: "amber" as const },
    {
      label: "Breached",
      count: stats?.jobs?.slaBreach || 0,
      color: "red" as const,
    },
  ];

  const jobTrendData = weeklyTrend || [
    { name: "Mon", jobs: 0, revenue: 0 },
    { name: "Tue", jobs: 0, revenue: 0 },
    { name: "Wed", jobs: 0, revenue: 0 },
    { name: "Thu", jobs: 0, revenue: 0 },
    { name: "Fri", jobs: 0, revenue: 0 },
    { name: "Sat", jobs: 0, revenue: 0 },
    { name: "Sun", jobs: 0, revenue: 0 },
  ];

  const chartJobTypeData = jobTypeData || [
    { name: "AI Only", value: 0 },
    { name: "On-Site", value: 0 },
    { name: "Certified", value: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-wider mt-1">
            Platform Performance Overview
          </p>
        </div>
        <div className="flex gap-1 bg-gray-950 border border-gray-800 clip-notch-sm overflow-hidden">
          {(["7d", "30d", "90d", "ytd"] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors",
                dateRange === range
                  ? "bg-lime-400/10 text-lime-400"
                  : "text-gray-500 hover:text-gray-300",
              )}
            >
              {range === "ytd" ? "YTD" : range}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            subtext={metric.subtext}
            icon={metric.icon}
            accentColor={metric.accentColor}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Job Trends Chart */}
        <div className="lg:col-span-2 relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400/30" />

          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-lime-400" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400">
              Weekly Job Trends
            </h2>
          </div>
          <AreaChart
            data={jobTrendData}
            series={[
              { dataKey: "jobs", name: "Jobs Completed", color: "#4ADE80" },
              { dataKey: "revenue", name: "Revenue ($)", color: "#6B7280" },
            ]}
            height={250}
            formatYAxis={(v) =>
              v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : String(v)
            }
          />
        </div>

        {/* Job Type Distribution */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400/30" />

          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
            Job Type Distribution
          </h2>
          <DonutChart data={chartJobTypeData} height={250} showLegend />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* SLA Status */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-lime-400" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400">
              SLA Status
            </h2>
          </div>
          <div className="space-y-1">
            {slaStatus.map((status) => (
              <SLAStatusItem
                key={status.label}
                label={status.label}
                count={status.count}
                color={status.color}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <Link
              href="/admin/jobs?status=breached"
              className="flex items-center gap-1 text-lime-400 text-sm font-mono uppercase tracking-wider hover:text-lime-300 transition-colors"
            >
              View SLA Breaches
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Disputes */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-400/30" />

          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400">
              Open Disputes
            </h2>
          </div>
          <div className="space-y-3">
            {activity?.recentDisputes?.length === 0 ? (
              <p className="text-gray-500 text-sm font-mono">
                No open disputes
              </p>
            ) : (
              activity?.recentDisputes?.map(
                (dispute: {
                  id: string;
                  subject: string;
                  createdAt: Date;
                  priority: number;
                }) => (
                  <div
                    key={dispute.id}
                    className="flex items-start gap-3 p-3 bg-gray-900 border border-gray-800 clip-notch-sm"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">
                        {dispute.subject}
                      </p>
                      <p className="text-label text-gray-500 font-mono">
                        {new Date(dispute.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-label font-mono clip-notch-sm",
                        dispute.priority === 1
                          ? "bg-red-400/20 text-red-400 border border-red-400/30"
                          : "bg-amber-400/20 text-amber-400 border border-amber-400/30",
                      )}
                    >
                      {dispute.priority === 1
                        ? "HIGH"
                        : dispute.priority === 2
                          ? "MEDIUM"
                          : "LOW"}
                    </span>
                  </div>
                ),
              )
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <Link
              href="/admin/disputes"
              className="flex items-center gap-1 text-amber-400 text-sm font-mono uppercase tracking-wider hover:text-amber-300 transition-colors"
            >
              View All Disputes
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-lime-400" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400">
              Today&apos;s Activity
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Period Appraisals</span>
              <span className="font-mono font-bold text-white">
                {stats?.appraisals?.period || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Completed Jobs</span>
              <span className="font-mono font-bold text-lime-400">
                {stats?.jobs?.completed || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Active Jobs</span>
              <span className="font-mono font-bold text-white">
                {stats?.jobs?.active || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Open Disputes</span>
              <span className="font-mono font-bold text-white">
                {stats?.disputes || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="relative bg-gray-950 border border-gray-800 clip-notch overflow-hidden">
        {/* Bracket corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400/30 z-10" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400/30 z-10" />

        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-mono text-sm uppercase tracking-wider text-gray-400">
            Recent Activity
          </h2>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-1 text-lime-400 text-sm font-mono uppercase tracking-wider hover:text-lime-300 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {activity?.recentAppraisals?.slice(0, 5).map((appraisal) => (
            <div
              key={appraisal.id}
              className="px-6 py-4 flex items-center gap-4 hover:bg-gray-900 transition-colors"
            >
              <div className="p-2 bg-lime-400/10 border border-lime-400/20 clip-notch-sm">
                <FileText className="w-4 h-4 text-lime-400" />
              </div>
              <p className="flex-1 text-gray-300">
                New appraisal request from{" "}
                <span className="text-white font-medium">
                  {appraisal.organization?.name || "Unknown"}
                </span>
              </p>
              <span className="text-label text-gray-500 font-mono">
                {formatTimeAgo(new Date(appraisal.createdAt))}
              </span>
            </div>
          ))}
          {!activity?.recentAppraisals?.length && (
            <div className="px-6 py-8 text-center text-gray-500 font-mono">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <QuickActionCard
          label="Manage Appraisers"
          href="/admin/appraisers"
          icon={UserCheck}
        />
        <QuickActionCard
          label="View All Jobs"
          href="/admin/jobs"
          icon={Briefcase}
        />
        <QuickActionCard
          label="Handle Disputes"
          href="/admin/disputes"
          icon={AlertTriangle}
        />
        <QuickActionCard
          label="Pricing Rules"
          href="/admin/pricing"
          icon={DollarSign}
        />
      </div>
    </div>
  );
}
