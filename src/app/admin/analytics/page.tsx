"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/shared/lib/trpc";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Clock,
  Star,
  Download,
  Calendar,
  MapPin,
  Users,
  Building,
} from "lucide-react";
import { AreaChart, DonutChart } from "@/shared/components/charts";
import { cn } from "@/shared/lib/utils";

type DateRange = "7d" | "30d" | "90d" | "ytd";

function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  accentColor = "lime",
}: {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "lime" | "amber" | "cyan" | "purple";
}) {
  const colorClasses = {
    lime: "text-lime-400 bg-lime-400/10 border-lime-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  };

  return (
    <div className="relative bg-gray-950 border border-gray-800 p-5 clip-notch group hover:border-gray-700 transition-colors">
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
              "flex items-center gap-1 text-xs font-mono",
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
      <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // Queries
  const { data: stats } = trpc.admin.dashboard.stats.useQuery();
  const { data: weeklyTrend } = trpc.admin.dashboard.weeklyTrend.useQuery();
  const { data: jobTypeDistribution } =
    trpc.admin.dashboard.jobTypeDistribution.useQuery();
  const { data: topAppraisersData } =
    trpc.admin.dashboard.topAppraisers.useQuery({ limit: 3 });
  const { data: topOrganizationsData } =
    trpc.admin.dashboard.topOrganizations.useQuery({ limit: 3 });
  const { data: topCountiesData } = trpc.admin.dashboard.topCounties.useQuery({
    limit: 5,
  });
  const { data: avgTurnaroundData } =
    trpc.admin.dashboard.averageTurnaround.useQuery();
  const { data: satisfactionScoreData } =
    trpc.admin.dashboard.satisfactionScore.useQuery();

  // Calculate metrics
  const totalRevenue = stats?.revenue?.thisMonth || 0;
  const totalJobs = stats?.jobs?.active || 0;
  const avgTurnaround = avgTurnaroundData ?? 0;
  const satisfactionScore = satisfactionScoreData ?? 0;

  // Prepare chart data
  const trendChartData = useMemo(() => {
    if (!weeklyTrend) {
      return [
        { name: "Mon", jobs: 0, revenue: 0 },
        { name: "Tue", jobs: 0, revenue: 0 },
        { name: "Wed", jobs: 0, revenue: 0 },
        { name: "Thu", jobs: 0, revenue: 0 },
        { name: "Fri", jobs: 0, revenue: 0 },
        { name: "Sat", jobs: 0, revenue: 0 },
        { name: "Sun", jobs: 0, revenue: 0 },
      ];
    }
    return weeklyTrend;
  }, [weeklyTrend]);

  const jobTypeData = useMemo(() => {
    if (!jobTypeDistribution) {
      return [
        { name: "AI Only", value: 0 },
        { name: "On-Site", value: 0 },
        { name: "Certified", value: 0 },
      ];
    }
    return jobTypeDistribution;
  }, [jobTypeDistribution]);

  // Transform query data for display
  const topAppraisers = useMemo(() => {
    if (!topAppraisersData) return [];
    return topAppraisersData.map((a) => ({
      name: a.name,
      jobs: a.completedJobs,
      rating: a.rating,
      revenue: `$${a.revenue.toLocaleString()}`,
    }));
  }, [topAppraisersData]);

  const topOrganizations = useMemo(() => {
    if (!topOrganizationsData) return [];
    return topOrganizationsData.map((o) => ({
      name: o.name,
      jobs: o.jobCount,
      plan:
        o.plan === "PROFESSIONAL"
          ? "Professional"
          : o.plan === "ENTERPRISE"
            ? "Enterprise"
            : o.plan === "STARTER"
              ? "Starter"
              : "Free Trial",
    }));
  }, [topOrganizationsData]);

  const topCounties = useMemo(() => {
    if (!topCountiesData) return [];
    return topCountiesData.map((c) => ({
      name: c.county,
      jobs: c.count,
      percentage: c.percentage,
    }));
  }, [topCountiesData]);

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "ytd", label: "YTD" },
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-lime-400/10 border border-lime-400/20 clip-notch-sm">
              <BarChart3 className="w-5 h-5 text-lime-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
          </div>
          <p className="text-gray-500 font-mono text-sm">
            Platform performance metrics and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center bg-gray-900 border border-gray-800 clip-notch-sm">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={cn(
                  "px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
                  dateRange === option.value
                    ? "bg-lime-400/10 text-lime-400"
                    : "text-gray-500 hover:text-gray-300",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white clip-notch-sm transition-colors">
            <Download className="w-4 h-4" />
            <span className="font-mono text-xs uppercase">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+12.5%"
          trend="up"
          icon={DollarSign}
          accentColor="lime"
        />
        <StatCard
          label="Jobs Completed"
          value={totalJobs}
          change="+8.2%"
          trend="up"
          icon={Briefcase}
          accentColor="amber"
        />
        <StatCard
          label="Avg Turnaround"
          value={`${avgTurnaround} days`}
          change="-15%"
          trend="up"
          icon={Clock}
          accentColor="cyan"
        />
        <StatCard
          label="Satisfaction"
          value={`${satisfactionScore}/5`}
          change="+0.3"
          trend="up"
          icon={Star}
          accentColor="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
            Revenue Over Time
          </h3>
          <AreaChart
            data={trendChartData}
            series={[
              { dataKey: "revenue", name: "Revenue ($)", color: "#a3e635" },
            ]}
            height={250}
            showLegend={false}
            formatYAxis={(v) =>
              v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
            }
          />
        </div>

        {/* Jobs Chart */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
            Jobs Completed
          </h3>
          <AreaChart
            data={trendChartData}
            series={[
              { dataKey: "jobs", name: "Jobs Completed", color: "#fbbf24" },
            ]}
            height={250}
            showLegend={false}
          />
        </div>
      </div>

      {/* Second Row: Distribution + Counties */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Job Type Distribution */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4">
            Jobs by Type
          </h3>
          <DonutChart data={jobTypeData} height={200} showLegend />
        </div>

        {/* Top Counties */}
        <div className="col-span-2 relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Top Counties
          </h3>
          <div className="space-y-3">
            {topCounties.map((county, index) => (
              <div key={county.name} className="flex items-center gap-4">
                <span className="w-6 text-gray-600 font-mono text-sm">
                  #{index + 1}
                </span>
                <span className="w-24 text-white font-medium">
                  {county.name}
                </span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-400 transition-all duration-500"
                    style={{ width: `${county.percentage}%` }}
                  />
                </div>
                <span className="w-16 text-right text-gray-400 font-mono text-sm">
                  {county.jobs} jobs
                </span>
                <span className="w-12 text-right text-lime-400 font-mono text-sm">
                  {county.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Top Performers */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Appraisers */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Appraisers
          </h3>

          <div className="space-y-3">
            {topAppraisers.map((appraiser, index) => (
              <div
                key={appraiser.name}
                className="flex items-center gap-4 p-3 bg-gray-900 border border-gray-800 clip-notch-sm hover:border-gray-700 transition-colors"
              >
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center font-bold clip-notch-sm",
                    index === 0
                      ? "bg-lime-400/20 text-lime-400"
                      : index === 1
                        ? "bg-gray-600/20 text-gray-400"
                        : "bg-amber-700/20 text-amber-600",
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{appraiser.name}</p>
                  <p className="text-gray-500 text-sm">
                    {appraiser.jobs} jobs completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-mono text-sm">
                      {appraiser.rating}
                    </span>
                  </div>
                  <p className="text-lime-400 font-mono text-sm">
                    {appraiser.revenue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Organizations */}
        <div className="relative bg-gray-950 border border-gray-800 p-6 clip-notch">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30" />

          <h3 className="font-mono text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Top Organizations
          </h3>

          <div className="space-y-3">
            {topOrganizations.map((org, index) => (
              <div
                key={org.name}
                className="flex items-center gap-4 p-3 bg-gray-900 border border-gray-800 clip-notch-sm hover:border-gray-700 transition-colors"
              >
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center font-bold clip-notch-sm",
                    index === 0
                      ? "bg-lime-400/20 text-lime-400"
                      : index === 1
                        ? "bg-gray-600/20 text-gray-400"
                        : "bg-amber-700/20 text-amber-600",
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{org.name}</p>
                  <p className="text-gray-500 text-sm">
                    {org.jobs} jobs this month
                  </p>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 font-mono text-xs uppercase clip-notch-sm",
                    org.plan === "Enterprise"
                      ? "bg-purple-400/10 text-purple-400"
                      : org.plan === "Professional"
                        ? "bg-lime-400/10 text-lime-400"
                        : "bg-gray-700/50 text-gray-400",
                  )}
                >
                  {org.plan}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
