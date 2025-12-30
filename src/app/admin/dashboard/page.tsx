"use client";

import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Briefcase,
  Building,
  UserCheck,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { AreaChart, BarChart, DonutChart } from "@/shared/components/charts";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { data: stats } = trpc.admin.dashboard.stats.useQuery();
  const { data: activity } = trpc.admin.dashboard.recentActivity.useQuery();

  const metrics = [
    {
      label: "Total Revenue",
      value: `$${stats?.revenue?.thisMonth?.toLocaleString() || "0"}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-green-500/10 text-green-500",
    },
    {
      label: "Active Jobs",
      value: stats?.jobs?.active || 0,
      change: "+8",
      trend: "up" as const,
      icon: Briefcase,
      color: "bg-[var(--primary)]/10 text-[var(--primary)]",
    },
    {
      label: "Appraisers",
      value: stats?.appraisers?.total || 0,
      subtext: `${stats?.appraisers?.verified || 0} verified`,
      icon: UserCheck,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      label: "Organizations",
      value: stats?.organizations || 0,
      subtext: `${stats?.appraisals?.thisWeek || 0} requests this week`,
      icon: Building,
      color: "bg-orange-500/10 text-orange-500",
    },
  ];

  const slaStatus = [
    { label: "On Track", count: (stats?.jobs?.active || 0) - (stats?.jobs?.slaBreach || 0), color: "bg-green-500" },
    { label: "At Risk", count: 0, color: "bg-yellow-500" },
    { label: "Breached", count: stats?.jobs?.slaBreach || 0, color: "bg-red-500" },
  ];

  // Mock chart data - would come from API in production
  const jobTrendData = [
    { name: "Mon", jobs: 12, revenue: 1800 },
    { name: "Tue", jobs: 19, revenue: 2850 },
    { name: "Wed", jobs: 15, revenue: 2250 },
    { name: "Thu", jobs: 22, revenue: 3300 },
    { name: "Fri", jobs: 28, revenue: 4200 },
    { name: "Sat", jobs: 8, revenue: 1200 },
    { name: "Sun", jobs: 5, revenue: 750 },
  ];

  const jobTypeData = [
    { name: "AI Only", value: 45 },
    { name: "On-Site", value: 35 },
    { name: "Certified", value: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Admin Dashboard</h1>
          <p className="text-[var(--muted-foreground)]">Overview of platform performance</p>
        </div>
        <div className="flex gap-2">
          <select
            onChange={() => {
              toast({
                title: "Feature in development",
                description: "Date range filtering is coming soon. Currently showing all-time data.",
              });
            }}
            className="px-4 py-2 border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] rounded-lg focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {metric.trend && (
                  <span
                    className={`flex items-center gap-1 text-sm ${
                      metric.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {metric.change}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{metric.value}</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{metric.subtext || metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Job Trends Chart */}
        <div className="col-span-2 bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--muted-foreground)]" />
            Weekly Job Trends
          </h2>
          <AreaChart
            data={jobTrendData}
            series={[
              { dataKey: "jobs", name: "Jobs Completed", color: "#3B6CF3" },
              { dataKey: "revenue", name: "Revenue ($)", color: "#10B981" },
            ]}
            height={250}
            formatYAxis={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : String(v))}
          />
        </div>

        {/* Job Type Distribution */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Job Type Distribution</h2>
          <DonutChart
            data={jobTypeData}
            height={250}
            showLegend
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* SLA Status */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--muted-foreground)]" />
            SLA Status
          </h2>
          <div className="space-y-4">
            {slaStatus.map((status) => (
              <div key={status.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-[var(--foreground)]">{status.label}</span>
                </div>
                <span className="font-semibold text-[var(--foreground)]">{status.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <Link href="/admin/jobs?status=breached" className="text-[var(--primary)] text-sm hover:underline">
              View SLA Breaches →
            </Link>
          </div>
        </div>

        {/* Recent Disputes */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--muted-foreground)]" />
            Open Disputes
          </h2>
          <div className="space-y-3">
            {activity?.recentDisputes?.length === 0 ? (
              <p className="text-[var(--muted-foreground)] text-sm">No open disputes</p>
            ) : (
              activity?.recentDisputes?.map((dispute: { id: string; subject: string; createdAt: Date; priority: number }) => (
                <div key={dispute.id} className="flex items-start gap-3 p-3 bg-[var(--secondary)] rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">{dispute.subject}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dispute.priority === 1
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {dispute.priority === 1 ? "HIGH" : dispute.priority === 2 ? "MEDIUM" : "LOW"}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <Link href="/admin/disputes" className="text-[var(--primary)] text-sm hover:underline">
              View All Disputes →
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--muted-foreground)]" />
            Today's Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Today&apos;s Appraisals</span>
              <span className="font-semibold text-[var(--foreground)]">{stats?.appraisals?.today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">This Week</span>
              <span className="font-semibold text-green-500">{stats?.appraisals?.thisWeek || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Active Jobs</span>
              <span className="font-semibold text-[var(--foreground)]">{stats?.jobs?.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Open Disputes</span>
              <span className="font-semibold text-[var(--foreground)]">{stats?.disputes || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--foreground)]">Recent Activity</h2>
          <Link href="/admin/activity" className="text-[var(--primary)] text-sm hover:underline">
            View All
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {[
            { icon: CheckCircle, color: "text-green-500", text: "Report #APR-2024-0892 completed", time: "5 min ago" },
            { icon: Users, color: "text-[var(--primary)]", text: "New appraiser registration: John Smith", time: "15 min ago" },
            { icon: AlertTriangle, color: "text-yellow-500", text: "SLA warning for job #JOB-7821", time: "32 min ago" },
            { icon: DollarSign, color: "text-green-500", text: "Payment received: $149 from Acme Lending", time: "1 hour ago" },
            { icon: FileText, color: "text-[var(--primary)]", text: "New appraisal request from Texas Home Loans", time: "2 hours ago" },
          ].map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <Icon className={`w-5 h-5 ${activity.color}`} />
                <p className="flex-1 text-[var(--foreground)]">{activity.text}</p>
                <span className="text-sm text-[var(--muted-foreground)]">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Manage Appraisers", href: "/admin/appraisers", icon: UserCheck },
          { label: "View All Jobs", href: "/admin/jobs", icon: Briefcase },
          { label: "Handle Disputes", href: "/admin/disputes", icon: AlertTriangle },
          { label: "Pricing Rules", href: "/admin/pricing", icon: DollarSign },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 flex items-center gap-3 hover:border-[var(--primary)] transition-colors"
            >
              <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
              <span className="font-medium text-[var(--foreground)]">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
