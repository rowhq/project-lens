"use client";

import { useMemo } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  Briefcase,
  DollarSign,
  Star,
  MapPin,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  StreakBanner,
  BadgeDisplay,
  DailyGoalWidget,
  LevelProgressWidget,
  calculateUnlockedBadges,
} from "@/shared/components/common/GamificationWidget";
import { getUrgencyConfig } from "@/shared/hooks/useLiveCountdown";

export default function AppraiserDashboardPage() {
  const { data: profile } = trpc.appraiser.profile.get.useQuery();
  const { data: availableJobs } = trpc.job.available.useQuery({ limit: 5 });
  const { data: activeJobs } = trpc.job.myActive.useQuery();
  const { data: earnings } = trpc.appraiser.earnings.summary.useQuery();

  // Calculate unlocked badges based on stats
  const unlockedBadges = calculateUnlockedBadges({
    completedJobs: profile?.completedJobs || 0,
    currentStreak: profile?.currentStreak || 0,
    totalEarnings: earnings?.totalEarnings || 0,
    rating: profile?.rating || 5.0,
    ratedJobs: profile?.completedJobs || 0,
  });

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
      icon: CheckCircle,
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

  // Pre-compute urgency data for active jobs (outside render)
  const activeJobsWithUrgency = useMemo(() => {
    if (!activeJobs) return [];
    const now = Date.now();
    return activeJobs.map((job) => {
      const hoursRemaining = job.slaDueAt
        ? (new Date(job.slaDueAt).getTime() - now) / (1000 * 60 * 60)
        : Infinity;
      return {
        ...job,
        hoursRemaining,
        urgency: getUrgencyConfig(hoursRemaining, hoursRemaining < 0),
      };
    });
  }, [activeJobs]);

  // Calculate jobs due today
  const jobsDueToday = useMemo(() => {
    if (!activeJobs) return [];
    const today = new Date().toDateString();
    return activeJobs.filter((job) => {
      if (!job.slaDueAt) return false;
      return new Date(job.slaDueAt).toDateString() === today;
    });
  }, [activeJobs]);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.user?.firstName || "Appraiser"}!
            </h1>
            <p className="text-white/70 mt-1">
              {availableJobs?.length || 0} new jobs available in your area
            </p>
          </div>
          {profile?.completedJobs && profile.completedJobs > 0 && (
            <div className="text-right">
              <p className="text-xs text-white/60">Total Earned</p>
              <p className="text-xl font-bold">${earnings?.totalEarnings?.toLocaleString() || "0"}</p>
            </div>
          )}
        </div>
        <Link
          href="/appraiser/jobs"
          className="inline-flex items-center gap-2 mt-4 bg-white text-[var(--primary)] px-4 py-2.5 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          <Zap className="w-4 h-4" />
          View Available Jobs
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Streak Banner */}
      <StreakBanner
        currentStreak={profile?.currentStreak || 0}
        longestStreak={profile?.longestStreak || 0}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
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

      {/* Daily Goal & Level Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyGoalWidget
          completedToday={earnings?.completedJobsToday || 0}
          dailyGoal={3}
          earningsToday={earnings?.todayEarnings || 0}
        />
        <LevelProgressWidget completedJobs={profile?.completedJobs || 0} />
      </div>

      {/* Urgent Jobs Alert */}
      {jobsDueToday.length > 0 && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-orange-400">
              {jobsDueToday.length} Job{jobsDueToday.length !== 1 ? "s" : ""} Due Today!
            </h3>
          </div>
          <div className="space-y-2">
            {jobsDueToday.map((job) => (
              <Link
                key={job.id}
                href={`/appraiser/jobs/${job.id}`}
                className="flex items-center justify-between p-3 bg-[var(--card)] rounded-lg hover:bg-[var(--secondary)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-[var(--foreground)]">{job.property?.addressLine1}</span>
                </div>
                <span className="text-sm text-orange-400 font-medium">
                  Due {new Date(job.slaDueAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs */}
      {activeJobs && activeJobs.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="font-semibold text-[var(--foreground)]">Active Jobs</h2>
            </div>
            <Link href="/appraiser/jobs?tab=active" className="text-[var(--primary)] text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {activeJobsWithUrgency.slice(0, 3).map((job) => (
                <Link
                  key={job.id}
                  href={`/appraiser/jobs/${job.id}`}
                  className="flex items-center justify-between p-4 hover:bg-[var(--secondary)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${job.urgency.bgClass || "bg-yellow-500/20"}`}>
                      <MapPin className={`w-5 h-5 ${job.urgency.textClass || "text-yellow-400"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{job.property?.addressLine1}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {job.property?.city}, {job.property?.state}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      job.status === "IN_PROGRESS"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {job.status.replace("_", " ")}
                    </span>
                    {job.slaDueAt && (
                      <p className={`text-sm mt-1 ${job.urgency.textClass || "text-[var(--muted-foreground)]"}`}>
                        {job.urgency.level !== "normal" && job.urgency.icon} Due {new Date(job.slaDueAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}

          </div>
        </div>
      )}

      {/* Achievements */}
      <BadgeDisplay
        unlockedBadges={unlockedBadges.map((b) => b.id)}
        onViewAll={() => {
          // Could open a modal or navigate to achievements page
        }}
      />

      {/* Available Jobs */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-400" />
            <h2 className="font-semibold text-[var(--foreground)]">Available Jobs</h2>
          </div>
          <Link href="/appraiser/jobs" className="text-[var(--primary)] text-sm hover:underline">
            View all
          </Link>
        </div>
        {!availableJobs?.length ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-[var(--foreground)] font-medium">No available jobs right now</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Check back soon or expand your service area</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {availableJobs.map((job) => (
              <Link
                key={job.id}
                href={`/appraiser/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--secondary)] transition-colors"
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

      {/* Weekly Performance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-medium text-[var(--foreground)]">This Week</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)] text-sm">Completed</span>
              <span className="font-bold text-[var(--foreground)]">
                {earnings?.completedJobsThisWeek || 0} jobs
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)] text-sm">Earnings</span>
              <span className="font-bold text-green-400">
                ${earnings?.weeklyEarnings?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h3 className="font-medium text-[var(--foreground)]">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)] text-sm">Completion</span>
              <span className="font-bold text-green-400">
                {profile?.completedJobs && profile?.cancelledJobs
                  ? Math.round((profile.completedJobs / (profile.completedJobs + profile.cancelledJobs)) * 100)
                  : 100}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)] text-sm">Total Jobs</span>
              <span className="font-bold text-[var(--foreground)]">
                {profile?.completedJobs || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profile?.verificationStatus !== "VERIFIED" && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-400">Complete Your Profile</p>
            <p className="text-sm text-yellow-400/80 mt-1">
              Verify your license and complete your profile to start receiving jobs.
            </p>
            <Link
              href="/appraiser/profile"
              className="inline-flex items-center gap-1 mt-2 text-yellow-400 font-medium hover:underline"
            >
              Complete Profile
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
