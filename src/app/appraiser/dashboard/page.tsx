"use client";

import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  Briefcase,
  DollarSign,
  Clock,
  Star,
  MapPin,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function AppraiserDashboardPage() {
  // Fixed: Use nested router paths
  const { data: profile } = trpc.appraiser.profile.get.useQuery();
  const { data: availableJobs } = trpc.job.available.useQuery({ limit: 5 });
  const { data: activeJobs } = trpc.job.myActive.useQuery();
  const { data: earnings } = trpc.appraiser.earnings.summary.useQuery();

  const stats = [
    {
      label: "This Month",
      value: `$${earnings?.monthlyEarnings?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/20",
    },
    {
      label: "Active Jobs",
      value: activeJobs?.length || 0,
      icon: Briefcase,
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary)]/20",
    },
    {
      label: "Completed",
      value: earnings?.completedJobsThisMonth || 0,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
    },
    {
      label: "Rating",
      value: profile?.rating?.toFixed(1) || "5.0",
      icon: Star,
      color: "text-purple-400",
      bg: "bg-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.user?.firstName || "Appraiser"}!
        </h1>
        <p className="text-white/70 mt-1">
          {availableJobs?.length || 0} new jobs available in your area
        </p>
        <Link
          href="/appraiser/jobs"
          className="inline-flex items-center gap-2 mt-4 bg-[var(--card)] text-[var(--primary)] px-4 py-2 rounded-lg font-medium hover:bg-[var(--secondary)]"
        >
          View Available Jobs
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Active Jobs */}
      {activeJobs && activeJobs.length > 0 && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">Active Jobs</h2>
            <Link href="/appraiser/jobs?filter=active" className="text-[var(--primary)] text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {activeJobs.map((job) => (
              <Link
                key={job.id}
                href={`/appraiser/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--secondary)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{job.property?.addressLine1}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {job.property?.city}, {job.property?.state}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    {job.status.replace("_", " ")}
                  </span>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Due {new Date(job.slaDueAt || "").toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Available Jobs */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--foreground)]">Available Jobs</h2>
          <Link href="/appraiser/jobs" className="text-[var(--primary)] text-sm hover:underline">
            View all
          </Link>
        </div>
        {!availableJobs?.length ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">
            <Briefcase className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
            <p>No available jobs in your area right now</p>
            <p className="text-sm mt-1">Check back soon or expand your service area</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {availableJobs.map((job) => (
              <Link
                key={job.id}
                href={`/appraiser/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--secondary)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{job.property?.addressLine1}</p>
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <span>{job.property?.city}</span>
                      <span>•</span>
                      <span>{job.distance?.toFixed(1)} mi away</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">${Number(job.payoutAmount)}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{job.jobType?.replace("_", " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-medium text-[var(--foreground)]">This Week</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Completed</span>
              <span className="font-medium text-[var(--foreground)]">
                {earnings?.completedJobsThisWeek || 0} jobs
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Earnings</span>
              <span className="font-medium text-green-400">
                ${earnings?.weeklyEarnings?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-medium text-[var(--foreground)]">Performance</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Completion Rate</span>
              <span className="font-medium text-green-400">
                {profile?.completedJobs && profile?.cancelledJobs
                  ? Math.round((profile.completedJobs / (profile.completedJobs + profile.cancelledJobs)) * 100)
                  : 100}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Total Jobs</span>
              <span className="font-medium text-[var(--foreground)]">
                {profile?.completedJobs || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {profile?.verificationStatus !== "VERIFIED" && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-400">Complete Your Profile</p>
            <p className="text-sm text-yellow-400/80 mt-1">
              Verify your license and complete your profile to start receiving jobs.
            </p>
            <Link
              href="/appraiser/profile"
              className="inline-block mt-2 text-yellow-400 font-medium hover:underline"
            >
              Complete Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
