"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import {
  Briefcase,
  DollarSign,
  Star,
  MapPin,
  ChevronRight,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  AlertTriangle,
} from "lucide-react";
import {
  StreakBanner,
  BadgeDisplay,
  DailyGoalWidget,
  LevelProgressWidget,
  calculateUnlockedBadges,
} from "@/shared/components/common/GamificationWidget";
import { getUrgencyConfig } from "@/shared/hooks/useLiveCountdown";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/components/ui/Skeleton";

// Stat Card - Ledger Style
function StatCard({
  label,
  value,
  icon: Icon,
  accentColor = "lime",
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "lime" | "amber" | "purple" | "red";
}) {
  const colorClasses = {
    lime: "text-lime-400 bg-lime-400/10 border-lime-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className="relative bg-[var(--card)] border border-[var(--border)] p-4 clip-notch-sm group hover:border-[var(--border)] transition-colors duration-fast">
      {/* Bracket corners */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-lime-400/30" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-lime-400/30" />

      <div className="flex items-center justify-between mb-2">
        <div
          className={cn("p-2 border clip-notch-sm", colorClasses[accentColor])}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-label text-[var(--muted-foreground)] font-mono uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}

// Job List Item - Ledger Style
function JobListItem({
  href,
  address,
  city,
  state,
  distance,
  payout,
  jobType,
  status,
  urgency,
  dueDate,
}: {
  href: string;
  address: string;
  city?: string;
  state?: string;
  distance?: number;
  payout?: number;
  jobType?: string;
  status?: string;
  urgency?: {
    textClass?: string;
    bgClass?: string;
    level?: string;
    icon?: string;
  };
  dueDate?: Date;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center clip-notch-sm",
            urgency?.bgClass || "bg-lime-400/10 border border-lime-400/20",
          )}
        >
          <MapPin
            className={cn("w-5 h-5", urgency?.textClass || "text-lime-400")}
          />
        </div>
        <div>
          <p className="font-medium text-white">{address}</p>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            {city && (
              <span>
                {city}
                {state && `, ${state}`}
              </span>
            )}
            {distance !== undefined && (
              <>
                <span
                  className="w-1 h-1 bg-[var(--muted-foreground)]"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  }}
                />
                <span>{distance.toFixed(1)} mi away</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        {payout !== undefined && (
          <p className="font-mono font-bold text-lime-400">${payout}</p>
        )}
        {status && (
          <span
            className={cn(
              "px-2 py-0.5 text-label font-mono clip-notch-sm",
              status === "IN_PROGRESS"
                ? "bg-purple-400/20 text-purple-400 border border-purple-400/30"
                : "bg-amber-400/20 text-amber-400 border border-amber-400/30",
            )}
          >
            {status.replace("_", " ")}
          </span>
        )}
        {jobType && !status && (
          <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase">
            {jobType.replace("_", " ")}
          </p>
        )}
        {dueDate && (
          <p
            className={cn(
              "text-sm mt-1",
              urgency?.textClass || "text-[var(--muted-foreground)]",
            )}
          >
            {urgency?.level !== "normal" && urgency?.icon} Due{" "}
            {dueDate.toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}

// Weekly Stat Card - Ledger Style
function WeeklyStatCard({
  title,
  icon: Icon,
  stats,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: { label: string; value: string | number; color?: string }[];
}) {
  return (
    <div className="relative bg-[var(--card)] border border-[var(--border)] p-4 clip-notch-sm">
      {/* Bracket corners */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-lime-400/30" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-lime-400/30" />

      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
        <h3 className="font-mono text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[var(--muted-foreground)] text-sm">
              {stat.label}
            </span>
            <span
              className={cn("font-mono font-bold", stat.color || "text-white")}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppraiserDashboardPage() {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = trpc.appraiser.profile.get.useQuery();
  const {
    data: availableJobs,
    isLoading: jobsLoading,
    isError: jobsError,
  } = trpc.job.available.useQuery({ limit: 5 });
  const {
    data: activeJobs,
    isLoading: activeLoading,
    isError: activeError,
  } = trpc.job.myActive.useQuery();
  const {
    data: earnings,
    isLoading: earningsLoading,
    isError: earningsError,
  } = trpc.appraiser.earnings.summary.useQuery();

  const isLoading =
    profileLoading || jobsLoading || activeLoading || earningsLoading;
  const hasError = profileError || jobsError || activeError || earningsError;

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
      accentColor: "lime" as const,
    },
    {
      label: "Active Jobs",
      value: activeJobs?.length || 0,
      icon: Briefcase,
      accentColor: "amber" as const,
    },
    {
      label: "Completed",
      value: earnings?.completedJobsThisMonth || 0,
      icon: CheckCircle,
      accentColor: "lime" as const,
    },
    {
      label: "Rating",
      value: profile?.rating?.toFixed(1) || "5.0",
      icon: Star,
      accentColor: "purple" as const,
    },
  ];

  // Client-side timestamp for hydration safety
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const interval = setInterval(updateNow, 60000);
    return () => clearInterval(interval);
  }, []);

  // Pre-compute urgency data for active jobs (only on client)
  const activeJobsWithUrgency = useMemo(() => {
    if (!activeJobs || now === null) return [];
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
  }, [activeJobs, now]);

  // Calculate jobs due today (only on client)
  const jobsDueToday = useMemo(() => {
    if (!activeJobs || now === null) return [];
    const today = new Date(now).toDateString();
    return activeJobs.filter((job) => {
      if (!job.slaDueAt) return false;
      return new Date(job.slaDueAt).toDateString() === today;
    });
  }, [activeJobs, now]);

  // Calculate license expiry warning (90/60/30 days)
  const licenseExpiryWarning = useMemo(() => {
    if (!profile?.licenseExpiry || now === null) return null;
    const expiryDate = new Date(profile.licenseExpiry);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry <= 0) {
      return {
        level: "expired",
        days: 0,
        message:
          "Your license has expired! You cannot accept jobs until renewed.",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        level: "critical",
        days: daysUntilExpiry,
        message: `Your license expires in ${daysUntilExpiry} days. Renew immediately to avoid service interruption.`,
      };
    } else if (daysUntilExpiry <= 60) {
      return {
        level: "warning",
        days: daysUntilExpiry,
        message: `Your license expires in ${daysUntilExpiry} days. Plan to renew soon.`,
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        level: "notice",
        days: daysUntilExpiry,
        message: `Your license expires in ${daysUntilExpiry} days.`,
      };
    }
    return null;
  }, [profile, now]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Welcome Banner Skeleton */}
        <div className="relative bg-[var(--card)] border border-lime-400/30 p-6 clip-notch">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-48 mt-4" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative bg-[var(--card)] border border-[var(--border)] p-4 clip-notch-sm"
            >
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-lime-400/30" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-lime-400/30" />
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-7 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Gamification Widgets Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative bg-[var(--card)] border border-[var(--border)] p-4 clip-notch-sm"
            >
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Jobs List Skeleton */}
        <div className="relative bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30 z-10" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30 z-10" />
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-b border-[var(--border)] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 clip-notch-sm" />
                  <div>
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative bg-[var(--card)] border border-red-500/30 p-8 clip-notch text-center max-w-md">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-red-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-red-500" />
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Unable to load dashboard
          </h2>
          <p className="text-[var(--muted-foreground)] mb-6 font-mono text-sm">
            There was an error loading your data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              "inline-flex items-center gap-2",
              "bg-lime-400 text-black",
              "px-6 py-3",
              "font-mono text-sm uppercase tracking-wider",
              "clip-notch-sm",
              "hover:bg-lime-300",
              "transition-colors duration-fast",
            )}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Ledger Style */}
      <div className="relative bg-[var(--card)] border border-lime-400/30 p-6 clip-notch overflow-hidden">
        {/* Bracket corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400" />

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #4ADE80 1px, transparent 1px),
                             linear-gradient(to bottom, #4ADE80 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, {profile?.user?.firstName || "Appraiser"}!
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1 font-mono text-sm">
              <span className="text-lime-400 font-bold">
                {availableJobs?.length || 0}
              </span>{" "}
              new jobs available in your area
            </p>
          </div>
          {profile?.completedJobs && profile.completedJobs > 0 && (
            <div className="text-right">
              <p className="text-label text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                Total Earned
              </p>
              <p className="text-xl font-bold text-lime-400 font-mono">
                ${earnings?.totalEarnings?.toLocaleString() || "0"}
              </p>
            </div>
          )}
        </div>
        <Link
          href="/appraiser/jobs"
          className={cn(
            "inline-flex items-center gap-2 mt-4",
            "bg-lime-400 text-black",
            "px-4 py-2.5",
            "font-mono text-sm uppercase tracking-wider",
            "clip-notch-sm",
            "hover:bg-lime-300",
            "transition-colors duration-fast",
          )}
        >
          <Zap className="w-4 h-4" />
          View Available Jobs
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* License Expiry Warning Banner */}
      {licenseExpiryWarning && (
        <div
          className={cn(
            "relative p-4 clip-notch",
            licenseExpiryWarning.level === "expired"
              ? "bg-red-500/10 border border-red-500/50"
              : licenseExpiryWarning.level === "critical"
                ? "bg-red-500/10 border border-red-500/30"
                : licenseExpiryWarning.level === "warning"
                  ? "bg-amber-500/10 border border-amber-500/30"
                  : "bg-blue-500/10 border border-blue-500/30",
          )}
        >
          {/* Bracket corners */}
          <div
            className={cn(
              "absolute top-0 left-0 w-3 h-3 border-t border-l",
              licenseExpiryWarning.level === "expired" ||
                licenseExpiryWarning.level === "critical"
                ? "border-red-500"
                : licenseExpiryWarning.level === "warning"
                  ? "border-amber-500"
                  : "border-blue-500",
            )}
          />
          <div
            className={cn(
              "absolute bottom-0 right-0 w-3 h-3 border-b border-r",
              licenseExpiryWarning.level === "expired" ||
                licenseExpiryWarning.level === "critical"
                ? "border-red-500"
                : licenseExpiryWarning.level === "warning"
                  ? "border-amber-500"
                  : "border-blue-500",
            )}
          />

          <div className="flex items-start gap-3">
            <AlertTriangle
              className={cn(
                "w-5 h-5 flex-shrink-0 mt-0.5",
                licenseExpiryWarning.level === "expired" ||
                  licenseExpiryWarning.level === "critical"
                  ? "text-red-500"
                  : licenseExpiryWarning.level === "warning"
                    ? "text-amber-500"
                    : "text-blue-500",
              )}
            />
            <div>
              <p
                className={cn(
                  "font-mono text-sm uppercase tracking-wider",
                  licenseExpiryWarning.level === "expired" ||
                    licenseExpiryWarning.level === "critical"
                    ? "text-red-500"
                    : licenseExpiryWarning.level === "warning"
                      ? "text-amber-500"
                      : "text-blue-500",
                )}
              >
                {licenseExpiryWarning.level === "expired"
                  ? "License Expired"
                  : "License Expiry Notice"}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {licenseExpiryWarning.message}
              </p>
              <Link
                href="/appraiser/profile"
                className={cn(
                  "inline-flex items-center gap-1 mt-2 font-mono text-sm uppercase tracking-wider transition-colors",
                  licenseExpiryWarning.level === "expired" ||
                    licenseExpiryWarning.level === "critical"
                    ? "text-red-500 hover:text-red-400"
                    : licenseExpiryWarning.level === "warning"
                      ? "text-amber-500 hover:text-amber-400"
                      : "text-blue-500 hover:text-blue-400",
                )}
              >
                Update License
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Streak Banner */}
      <StreakBanner
        currentStreak={profile?.currentStreak || 0}
        longestStreak={profile?.longestStreak || 0}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            accentColor={stat.accentColor}
          />
        ))}
      </div>

      {/* Daily Goal & Level Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DailyGoalWidget
          completedToday={earnings?.completedJobsToday || 0}
          dailyGoal={3}
          earningsToday={earnings?.todayEarnings || 0}
        />
        <LevelProgressWidget completedJobs={profile?.completedJobs || 0} />
      </div>

      {/* Urgent Jobs Alert - Ledger Style */}
      {jobsDueToday.length > 0 && (
        <div className="relative bg-[var(--card)] border border-amber-400/30 p-4 clip-notch">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-400" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-400" />

          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono text-sm uppercase tracking-wider text-amber-400">
              {jobsDueToday.length} Job{jobsDueToday.length !== 1 ? "s" : ""}{" "}
              Due Today!
            </h3>
          </div>
          <div className="space-y-2">
            {jobsDueToday.map((job) => (
              <Link
                key={job.id}
                href={`/appraiser/jobs/${job.id}`}
                className="flex items-center justify-between p-3 bg-[var(--muted)] border border-[var(--border)] clip-notch-sm hover:border-amber-400/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="font-medium text-white">
                    {job.property?.addressLine1}
                  </span>
                </div>
                <span className="text-sm text-amber-400 font-mono">
                  Due{" "}
                  {new Date(job.slaDueAt!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs - Ledger Style */}
      {activeJobs && activeJobs.length > 0 && (
        <div className="relative bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-400/30 z-10" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-400/30 z-10" />

          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="font-mono text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
                Active Jobs
              </h2>
            </div>
            <Link
              href="/appraiser/jobs?tab=active"
              className="flex items-center gap-1 text-lime-400 text-sm font-mono uppercase tracking-wider hover:text-lime-300 transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div>
            {activeJobsWithUrgency.slice(0, 3).map((job) => (
              <JobListItem
                key={job.id}
                href={`/appraiser/jobs/${job.id}`}
                address={job.property?.addressLine1 || ""}
                city={job.property?.city}
                state={job.property?.state}
                status={job.status}
                urgency={job.urgency}
                dueDate={job.slaDueAt ? new Date(job.slaDueAt) : undefined}
              />
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

      {/* Available Jobs - Ledger Style */}
      <div className="relative bg-[var(--card)] border border-[var(--border)] clip-notch overflow-hidden">
        {/* Bracket corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400/30 z-10" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400/30 z-10" />

        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-lime-400" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-[var(--muted-foreground)]">
              Available Jobs
            </h2>
          </div>
          <Link
            href="/appraiser/jobs"
            className="flex items-center gap-1 text-lime-400 text-sm font-mono uppercase tracking-wider hover:text-lime-300 transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {!availableJobs?.length ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center clip-notch">
              <Briefcase className="w-8 h-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-white font-medium">
              No available jobs right now
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 font-mono">
              Check back soon or expand your service area
            </p>
          </div>
        ) : (
          <div>
            {availableJobs.map((job) => (
              <JobListItem
                key={job.id}
                href={`/appraiser/jobs/${job.id}`}
                address={job.property?.addressLine1 || ""}
                city={job.property?.city}
                state={job.property?.state}
                distance={job.distance}
                payout={Number(job.payoutAmount)}
                jobType={job.jobType}
              />
            ))}
          </div>
        )}
      </div>

      {/* Weekly Performance - Ledger Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WeeklyStatCard
          title="This Week"
          icon={Calendar}
          stats={[
            {
              label: "Completed",
              value: `${earnings?.completedJobsThisWeek || 0} jobs`,
              color: "text-white",
            },
            {
              label: "Earnings",
              value: `$${earnings?.weeklyEarnings?.toLocaleString() || "0"}`,
              color: "text-lime-400",
            },
          ]}
        />
        <WeeklyStatCard
          title="Performance"
          icon={TrendingUp}
          stats={[
            {
              label: "Completion",
              value: `${
                profile?.completedJobs && profile?.cancelledJobs
                  ? Math.round(
                      (profile.completedJobs /
                        (profile.completedJobs + profile.cancelledJobs)) *
                        100,
                    )
                  : 100
              }%`,
              color: "text-lime-400",
            },
            {
              label: "Total Jobs",
              value: profile?.completedJobs || 0,
              color: "text-white",
            },
          ]}
        />
      </div>

      {/* Profile Completion Alert - Ledger Style */}
      {profile?.verificationStatus !== "VERIFIED" && (
        <div className="relative bg-[var(--card)] border border-amber-400/30 p-4 clip-notch">
          {/* Bracket corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-400" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-400" />

          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-sm uppercase tracking-wider text-amber-400">
                Complete Your Profile
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Verify your license and complete your profile to start receiving
                jobs.
              </p>
              <Link
                href="/appraiser/profile"
                className="inline-flex items-center gap-1 mt-2 text-amber-400 font-mono text-sm uppercase tracking-wider hover:text-amber-300 transition-colors"
              >
                Complete Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
