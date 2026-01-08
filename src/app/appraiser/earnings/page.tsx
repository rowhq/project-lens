"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  getData,
  setData,
  STORES,
  useOnlineStatus,
} from "@/shared/lib/offline-storage";
import {
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  Briefcase,
  Loader2,
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  Trophy,
  Flame,
  Edit3,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { AreaChart } from "@/shared/components/charts";

const MONTHLY_GOAL_KEY = "appraiser_monthly_goal";

// Types for cached data
interface CachedEarnings {
  totalEarnings: number;
  todayEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  pendingPayout: number;
  completedJobsToday: number;
  completedJobsThisMonth: number;
  completedJobsThisWeek: number;
  rating: number | null;
  completedJobs: number;
}

interface CachedPayout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function EarningsPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(5000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("5000");

  // Offline support
  const isOnline = useOnlineStatus();
  const [cachedEarnings, setCachedEarnings] = useState<CachedEarnings | null>(
    null,
  );
  const [cachedPayouts, setCachedPayouts] = useState<{
    items: CachedPayout[];
  } | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const [earningsCache, payoutsCache] = await Promise.all([
          getData<CachedEarnings>(STORES.EARNINGS, "summary"),
          getData<{ items: CachedPayout[] }>(STORES.EARNINGS, "history"),
        ]);
        if (earningsCache) setCachedEarnings(earningsCache);
        if (payoutsCache) setCachedPayouts(payoutsCache);
      } catch (error) {
        console.error("Failed to load cached earnings:", error);
      }
    };
    loadCachedData();
  }, []);

  // Load monthly goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem(MONTHLY_GOAL_KEY);
    if (savedGoal) {
      setMonthlyGoal(Number(savedGoal));
      setGoalInput(savedGoal);
    }
  }, []);

  // Fixed: Use nested router path - appraiser.earnings.summary (no date params - it calculates internally)
  const {
    data: earnings,
    isLoading: earningsLoading,
    isError: earningsError,
    refetch: refetchEarnings,
    dataUpdatedAt,
  } = trpc.appraiser.earnings.summary.useQuery(undefined, {
    enabled: isOnline,
  });

  // Fixed: Use nested router path - appraiser.earnings.history
  const {
    data: payouts,
    isLoading: payoutsLoading,
    isError: payoutsError,
    refetch: refetchPayouts,
  } = trpc.appraiser.earnings.history.useQuery(
    { limit: 10 },
    { enabled: isOnline },
  );

  // Combined loading state
  const isLoading = earningsLoading || payoutsLoading;

  // Cache data when fetched successfully
  useEffect(() => {
    if (earnings && isOnline) {
      setData(STORES.EARNINGS, "summary", earnings, 4 * 60 * 60 * 1000); // Cache for 4 hours
    }
  }, [earnings, isOnline]);

  useEffect(() => {
    if (payouts && isOnline) {
      setData(STORES.EARNINGS, "history", payouts, 4 * 60 * 60 * 1000); // Cache for 4 hours
    }
  }, [payouts, isOnline]);

  // Derive isUsingCache from online status and query state (no setState needed)
  const isUsingCache = !isOnline || !!earningsError;

  // Effective data (use API data if available, fallback to cache)
  const effectiveEarnings = earnings || cachedEarnings;
  const effectivePayouts = payouts || cachedPayouts;

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot refresh while offline. Showing cached data.",
        variant: "destructive",
      });
      return;
    }
    await Promise.all([refetchEarnings(), refetchPayouts()]);
    toast({
      title: "Refreshed",
      description: "Earnings data has been updated.",
    });
  }, [isOnline, refetchEarnings, refetchPayouts, toast]);

  // Get payout settings (Stripe Connect status)
  const { data: payoutSettings } = trpc.billing.payout.settings.useQuery();

  // Payout settings mutation for changing payout method
  const setupPayoutLink = trpc.billing.payout.setupLink.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to open payout settings",
        variant: "destructive",
      });
    },
  });

  const handleExport = async () => {
    setIsExporting(true);

    // Generate CSV from payout history
    if (!payouts?.items?.length) {
      toast({
        title: "No data to export",
        description: "There are no payouts to export yet.",
      });
      setIsExporting(false);
      return;
    }

    try {
      const headers = ["Date", "Amount", "Status"];
      const rows = payouts.items.map((payout) => [
        new Date(payout.createdAt).toLocaleDateString(),
        `$${Number(payout.amount).toLocaleString()}`,
        payout.status,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `earnings-${selectedMonth.getFullYear()}-${selectedMonth.getMonth() + 1}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: "Your earnings data has been downloaded.",
      });
    } catch {
      toast({
        title: "Export failed",
        description:
          "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangePayoutMethod = () => {
    setupPayoutLink.mutate();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Calculate average per job
  const avgPerJob =
    effectiveEarnings?.completedJobsThisMonth &&
    effectiveEarnings.completedJobsThisMonth > 0
      ? effectiveEarnings.monthlyEarnings /
        effectiveEarnings.completedJobsThisMonth
      : 0;

  // Save monthly goal
  const saveMonthlyGoal = () => {
    const newGoal = Number(goalInput);
    if (isNaN(newGoal) || newGoal < 100) {
      toast({
        title: "Invalid goal",
        description: "Please enter a goal of at least $100",
        variant: "destructive",
      });
      return;
    }
    if (newGoal > 1000000) {
      toast({
        title: "Invalid goal",
        description: "Goal cannot exceed $1,000,000",
        variant: "destructive",
      });
      return;
    }
    setMonthlyGoal(newGoal);
    localStorage.setItem(MONTHLY_GOAL_KEY, String(newGoal));
    setIsEditingGoal(false);
    toast({
      title: "Goal updated",
      description: `Your monthly goal is now $${newGoal.toLocaleString()}`,
    });
  };

  // Calculate earnings projections
  const projections = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const dayOfMonth = now.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;
    const daysElapsed = dayOfMonth;

    const currentMonthlyEarnings = effectiveEarnings?.monthlyEarnings || 0;
    const jobsThisMonth = effectiveEarnings?.completedJobsThisMonth || 0;

    // Calculate daily average based on days worked (not calendar days)
    const dailyAverage =
      daysElapsed > 0 ? currentMonthlyEarnings / daysElapsed : 0;
    const jobsPerDay = daysElapsed > 0 ? jobsThisMonth / daysElapsed : 0;

    // Project to end of month
    const projectedMonthlyTotal =
      currentMonthlyEarnings + dailyAverage * daysRemaining;
    const projectedJobsTotal =
      jobsThisMonth + Math.round(jobsPerDay * daysRemaining);

    // Weekly projections
    const weeklyAverage = effectiveEarnings?.weeklyEarnings || 0;
    const projectedWeeklyRate = weeklyAverage; // Based on current week

    // Goal progress
    const goalProgress =
      monthlyGoal > 0 ? (currentMonthlyEarnings / monthlyGoal) * 100 : 0;
    const onTrackForGoal = projectedMonthlyTotal >= monthlyGoal;
    const amountToGoal = monthlyGoal - currentMonthlyEarnings;
    const dailyNeededForGoal =
      daysRemaining > 0 ? amountToGoal / daysRemaining : 0;

    // Compare to last week
    const weeklyGrowth =
      effectiveEarnings?.weeklyEarnings &&
      (effectiveEarnings?.monthlyEarnings || 0) > 0
        ? (effectiveEarnings.weeklyEarnings /
            (effectiveEarnings.monthlyEarnings / 4) -
            1) *
          100
        : 0;

    return {
      daysRemaining,
      daysElapsed,
      dailyAverage,
      jobsPerDay,
      projectedMonthlyTotal,
      projectedJobsTotal,
      projectedWeeklyRate,
      goalProgress: Math.min(goalProgress, 100),
      onTrackForGoal,
      amountToGoal: Math.max(0, amountToGoal),
      dailyNeededForGoal: Math.max(0, dailyNeededForGoal),
      weeklyGrowth,
    };
  }, [effectiveEarnings, monthlyGoal]);

  // Calculate daily earnings from payout history (last 30 days)
  const dailyEarningsData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayData: Record<string, { earnings: number; jobs: number }> = {
      Mon: { earnings: 0, jobs: 0 },
      Tue: { earnings: 0, jobs: 0 },
      Wed: { earnings: 0, jobs: 0 },
      Thu: { earnings: 0, jobs: 0 },
      Fri: { earnings: 0, jobs: 0 },
      Sat: { earnings: 0, jobs: 0 },
      Sun: { earnings: 0, jobs: 0 },
    };

    // Group payouts by day of week (from last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    effectivePayouts?.items?.forEach((payout) => {
      const date = new Date(payout.createdAt);
      if (date >= thirtyDaysAgo && payout.status === "COMPLETED") {
        const dayName = days[date.getDay()];
        dayData[dayName].earnings += Number(payout.amount);
        dayData[dayName].jobs += 1;
      }
    });

    // Return in Mon-Sun order
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
      name: day,
      earnings: Math.round(dayData[day].earnings),
      jobs: dayData[day].jobs,
    }));
  }, [effectivePayouts]);

  // Format time ago for stale data indicator
  const formatTimeAgo = useCallback((timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, []);

  const stats = [
    {
      label: "Total Earned",
      value: `$${effectiveEarnings?.totalEarnings?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "bg-green-500/10 text-green-500",
    },
    {
      label: "This Month",
      value: `$${effectiveEarnings?.monthlyEarnings?.toLocaleString() || "0"}`,
      icon: Briefcase,
      color: "bg-[var(--primary)]/10 text-[var(--primary)]",
    },
    {
      label: "Pending Payout",
      value: `$${effectiveEarnings?.pendingPayout?.toLocaleString() || "0"}`,
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      label: "Avg per Job",
      value: `$${avgPerJob.toFixed(0)}`,
      icon: TrendingUp,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  // Loading Skeleton
  if (isLoading && !effectiveEarnings) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-[var(--muted)] rounded mb-2" />
            <div className="h-4 w-48 bg-[var(--muted)] rounded" />
          </div>
          <div className="h-10 w-24 bg-[var(--muted)] rounded" />
        </div>

        {/* Month Selector Skeleton */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-10 w-10 bg-[var(--muted)] rounded" />
          <div className="h-6 w-40 bg-[var(--muted)] rounded" />
          <div className="h-10 w-10 bg-[var(--muted)] rounded" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4"
            >
              <div className="w-10 h-10 bg-[var(--muted)] rounded-lg mb-3" />
              <div className="h-8 w-20 bg-[var(--muted)] rounded mb-2" />
              <div className="h-4 w-16 bg-[var(--muted)] rounded" />
            </div>
          ))}
        </div>

        {/* Goal Progress Skeleton */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="h-6 w-32 bg-[var(--muted)] rounded mb-4" />
          <div className="h-3 w-full bg-[var(--muted)] rounded-full mb-3" />
          <div className="h-10 w-full bg-[var(--muted)] rounded" />
        </div>

        {/* Projections Skeleton */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="h-6 w-40 bg-[var(--muted)] rounded mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[var(--muted)] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (earningsError && payoutsError && !effectiveEarnings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <DollarSign className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
          Failed to Load Earnings
        </h2>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-md">
          There was an error loading your earnings data. Please check your
          connection and try again.
        </p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Offline Banner */}
      {(!isOnline || isUsingCache) && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-400">
                {!isOnline ? "You're offline" : "Showing cached data"}
              </p>
              <p className="text-sm text-yellow-400/80">
                {!isOnline
                  ? "Viewing cached earnings data. Connect to the internet to see latest updates."
                  : "Unable to fetch latest data. Showing previously cached information."}
              </p>
            </div>
          </div>
          {isOnline && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Earnings
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Track your income and payouts
            {dataUpdatedAt && !isUsingCache && (
              <span className="text-xs ml-2 opacity-60">
                · Updated {formatTimeAgo(dataUpdatedAt)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOnline && !isUsingCache && (
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-[var(--secondary)] rounded-lg text-[var(--muted-foreground)]"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--foreground)] disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-[var(--secondary)] rounded-lg text-[var(--foreground)]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-lg font-semibold text-[var(--foreground)] min-w-[180px] text-center">
          {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
        </div>
        <button
          onClick={() => navigateMonth("next")}
          disabled={selectedMonth >= new Date()}
          className="p-2 hover:bg-[var(--secondary)] rounded-lg disabled:opacity-50 text-[var(--foreground)]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4"
            >
              <div
                className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Monthly Goal Progress */}
      <div className="bg-gradient-to-r from-[var(--primary)]/20 to-purple-500/20 rounded-xl border border-[var(--primary)]/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="font-bold text-[var(--foreground)]">Monthly Goal</h3>
          </div>
          {isEditingGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-24 px-2 py-1 text-sm bg-[var(--card)] border border-[var(--border)] rounded text-[var(--foreground)]"
                autoFocus
              />
              <button
                onClick={saveMonthlyGoal}
                className="px-2 py-1 text-sm bg-[var(--primary)] text-black font-medium rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="px-2 py-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setGoalInput(String(monthlyGoal));
                setIsEditingGoal(true);
              }}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
            >
              <Edit3 className="w-4 h-4" />
              Edit Goal
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                ${effectiveEarnings?.monthlyEarnings?.toLocaleString() || "0"}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                of ${monthlyGoal.toLocaleString()} goal
              </p>
            </div>
            <p className="text-xl font-bold text-[var(--primary)]">
              {projections.goalProgress.toFixed(0)}%
            </p>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-purple-500 transition-all"
              style={{ width: `${projections.goalProgress}%` }}
            />
          </div>
        </div>

        {/* Goal Status */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            projections.onTrackForGoal
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {projections.onTrackForGoal ? (
            <>
              <Trophy className="w-5 h-5" />
              <span className="font-medium">On track to reach your goal!</span>
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" />
              <span className="font-medium">
                Earn ${projections.dailyNeededForGoal.toFixed(0)}/day to hit
                your goal
              </span>
            </>
          )}
        </div>
      </div>

      {/* Earnings Projections */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="font-semibold text-[var(--foreground)]">
            Earnings Projections
          </h2>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          {/* Projected Monthly Total */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
            <p className="text-sm text-[var(--muted-foreground)] mb-1">
              Projected This Month
            </p>
            <p className="text-2xl font-bold text-green-400">
              ${projections.projectedMonthlyTotal.toFixed(0).toLocaleString()}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Based on current pace
            </p>
          </div>

          {/* Daily Average */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
            <p className="text-sm text-[var(--muted-foreground)] mb-1">
              Daily Average
            </p>
            <p className="text-2xl font-bold text-blue-400">
              ${projections.dailyAverage.toFixed(0)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {projections.jobsPerDay.toFixed(1)} jobs/day
            </p>
          </div>

          {/* Days Remaining */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-sm text-[var(--muted-foreground)] mb-1">
              Days Remaining
            </p>
            <p className="text-2xl font-bold text-purple-400">
              {projections.daysRemaining}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {projections.daysElapsed} days completed
            </p>
          </div>

          {/* Amount to Goal */}
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl p-4 border border-orange-500/20">
            <p className="text-sm text-[var(--muted-foreground)] mb-1">
              Needed for Goal
            </p>
            <p className="text-2xl font-bold text-orange-400">
              ${projections.amountToGoal.toFixed(0).toLocaleString()}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              ${projections.dailyNeededForGoal.toFixed(0)}/day needed
            </p>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="px-4 pb-4">
          <div className="bg-[var(--secondary)] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--muted-foreground)]" />
              <span className="text-sm text-[var(--foreground)]">
                This Week vs Average
              </span>
            </div>
            <div
              className={`flex items-center gap-1 font-medium ${
                projections.weeklyGrowth >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {projections.weeklyGrowth >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(projections.weeklyGrowth).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
        <h2 className="font-semibold text-[var(--foreground)] mb-4">
          Daily Earnings
        </h2>
        <AreaChart
          data={dailyEarningsData}
          series={[
            { dataKey: "earnings", name: "Earnings ($)", color: "#10B981" },
            { dataKey: "jobs", name: "Jobs", color: "#3B6CF3" },
          ]}
          height={200}
          formatYAxis={(v) => (v >= 100 ? `$${v}` : String(v))}
        />
      </div>

      {/* Payout Methods */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--foreground)]">
            Payout Method
          </h2>
          <button
            onClick={handleChangePayoutMethod}
            disabled={setupPayoutLink.isPending}
            className="text-[var(--primary)] text-sm hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {setupPayoutLink.isPending && (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            {setupPayoutLink.isPending ? "Loading..." : "Change"}
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-[var(--secondary)] rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
              <div>
                {payoutSettings?.payoutEnabled ? (
                  <>
                    <p className="font-medium text-[var(--foreground)]">
                      Stripe Connect Account
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Payouts enabled - weekly on Monday
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-[var(--foreground)]">
                      No payout method configured
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Set up your bank account to receive payouts
                    </p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setupPayoutLink.mutate()}
              disabled={setupPayoutLink.isPending}
              className="px-3 py-1.5 text-sm bg-[var(--primary)] text-black font-medium rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {setupPayoutLink.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : payoutSettings?.payoutEnabled ? (
                "Update"
              ) : (
                "Set Up"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">
            Payout History
          </h2>
        </div>
        {!effectivePayouts?.items?.length ? (
          <div className="p-8 text-center text-[var(--muted-foreground)]">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-[var(--muted)]" />
            <p>No payouts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {effectivePayouts.items.map((payout) => (
              <div
                key={payout.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      payout.status === "COMPLETED"
                        ? "bg-green-500/20"
                        : "bg-yellow-500/20"
                    }`}
                  >
                    {payout.status === "COMPLETED" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      ${Number(payout.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payout.status === "COMPLETED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {payout.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job Stats Summary */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">
            Performance Summary
          </h2>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {effectiveEarnings?.completedJobsThisMonth || 0}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Jobs this month
            </p>
          </div>
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {effectiveEarnings?.completedJobsThisWeek || 0}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Jobs this week
            </p>
          </div>
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {effectiveEarnings?.completedJobs || 0}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Total jobs completed
            </p>
          </div>
          <div className="text-center p-4 bg-[var(--secondary)] rounded-lg">
            <p className="text-3xl font-bold text-yellow-500">
              {effectiveEarnings?.rating?.toFixed(1) || "5.0"} ★
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              Average rating
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
