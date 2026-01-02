"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSwipeable } from "react-swipeable";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { usePullToRefresh } from "@/shared/hooks/usePullToRefresh";
import { getUrgencyConfig } from "@/shared/hooks/useLiveCountdown";
import {
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Briefcase,
  CheckCircle,
  Navigation,
  X,
  Loader2,
  SlidersHorizontal,
  Map,
  List,
  Check,
  WifiOff,
  RefreshCw,
  ArrowUpDown,
  Zap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/shared/components/common/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-[var(--muted)] rounded-lg animate-pulse" />
    ),
  },
);

type JobFilter = "available" | "active" | "completed";
type ViewMode = "list" | "map";
type SortBy = "distance" | "payout" | "urgency";

interface AdvancedFilters {
  maxDistance: number | null;
  minPayout: number | null;
  jobType: string | null;
}

// Swipeable Job Card Component
const SwipeableJobCard = ({
  job,
  filter,
  onSkip,
  onAccept,
  isSkipping,
  isAccepting,
  now,
}: {
  job: Record<string, unknown> & {
    id: string;
    slaDueAt?: string | Date | null;
    payoutAmount?: number | { toNumber(): number };
    distance?: number;
    status?: string;
    jobType?: string;
    property?: {
      addressLine1?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    };
  };
  filter: JobFilter;
  onSkip: (jobId: string) => void;
  onAccept: (jobId: string) => void;
  isSkipping: boolean;
  isAccepting: boolean;
  now: number | null;
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (filter !== "available") return;
      setSwipeOffset(eventData.deltaX);
      setSwipeDirection(eventData.deltaX > 0 ? "right" : "left");
    },
    onSwipedLeft: () => {
      if (filter === "available" && Math.abs(swipeOffset) > 100) {
        onSkip(job.id);
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      }
      setSwipeOffset(0);
      setSwipeDirection(null);
    },
    onSwipedRight: () => {
      if (filter === "available" && Math.abs(swipeOffset) > 100) {
        onAccept(job.id);
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(100);
      }
      setSwipeOffset(0);
      setSwipeDirection(null);
    },
    onSwiped: () => {
      setSwipeOffset(0);
      setSwipeDirection(null);
    },
    trackMouse: false,
    preventScrollOnSwipe: true,
    delta: 10,
  });

  // Calculate urgency using passed timestamp (only when now is available)
  const hoursRemaining =
    job.slaDueAt && now !== null
      ? (new Date(job.slaDueAt).getTime() - now) / (1000 * 60 * 60)
      : Infinity;
  const urgency = getUrgencyConfig(hoursRemaining, hoursRemaining < 0);

  const swipeProgress = Math.min(Math.abs(swipeOffset) / 100, 1);

  return (
    <div
      {...(filter === "available" ? handlers : {})}
      className="relative overflow-hidden rounded-lg"
    >
      {/* Swipe indicators underneath */}
      {filter === "available" && (
        <div
          className="absolute inset-0 flex items-center justify-between px-6 z-0"
          style={{ opacity: swipeProgress }}
        >
          <div
            className={`flex items-center gap-2 font-bold transition-all ${
              swipeDirection === "right"
                ? "text-green-500 scale-110"
                : "text-green-500/50"
            }`}
          >
            <Check className="w-8 h-8" />
            <span className="text-lg">ACCEPT</span>
          </div>
          <div
            className={`flex items-center gap-2 font-bold transition-all ${
              swipeDirection === "left"
                ? "text-red-500 scale-110"
                : "text-red-500/50"
            }`}
          >
            <span className="text-lg">SKIP</span>
            <X className="w-8 h-8" />
          </div>
        </div>
      )}

      {/* Job card with transform */}
      <Link
        href={`/appraiser/jobs/${job.id}`}
        className={`block bg-[var(--card)] rounded-lg border p-4 relative z-10 transition-shadow ${
          urgency.level !== "normal"
            ? `border-2 ${urgency.bgClass}`
            : "border-[var(--border)]"
        } hover:shadow-lg`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        {/* Urgency Badge */}
        {urgency.level !== "normal" && urgency.label && (
          <div
            className={`absolute -top-2 -right-2 ${urgency.badgeClass} px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold z-20`}
          >
            <span>{urgency.icon}</span>
            <span>{urgency.label}</span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                filter === "available"
                  ? "bg-green-500/20"
                  : filter === "active"
                    ? "bg-yellow-500/20"
                    : "bg-[var(--muted)]"
              }`}
            >
              <MapPin
                className={`w-6 h-6 ${
                  filter === "available"
                    ? "text-green-400"
                    : filter === "active"
                      ? "text-yellow-400"
                      : "text-[var(--muted-foreground)]"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--foreground)] truncate">
                {job.property?.addressLine1}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {job.property?.city}, {job.property?.state}{" "}
                {job.property?.zipCode}
              </p>
            </div>
          </div>

          {/* Action buttons for non-swipe interaction */}
          <div className="flex items-center gap-2">
            {filter === "available" && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSkip(job.id);
                  }}
                  disabled={isSkipping}
                  className="p-2.5 rounded-lg bg-[var(--muted)] hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50 touch-manipulation"
                  title="Skip this job"
                >
                  {isSkipping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAccept(job.id);
                  }}
                  disabled={isAccepting}
                  className="p-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors disabled:opacity-50 touch-manipulation"
                  title="Accept this job"
                >
                  {isAccepting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              </>
            )}
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="font-bold text-green-400">
              ${Number(job.payoutAmount)}
            </span>
          </div>

          {filter === "available" &&
            "distance" in job &&
            (job as { distance?: number }).distance && (
              <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                <Navigation className="w-4 h-4" />
                <span>
                  {((job as { distance?: number }).distance ?? 0).toFixed(1)} mi
                </span>
              </div>
            )}

          <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
            <Briefcase className="w-4 h-4" />
            <span>{job.jobType?.replace("_", " ")}</span>
          </div>

          {job.slaDueAt && (
            <div className={`flex items-center gap-1 ${urgency.textClass}`}>
              <Clock className="w-4 h-4" />
              <span>
                {hoursRemaining < 0
                  ? "Overdue"
                  : hoursRemaining < 24
                    ? `${Math.round(hoursRemaining)}h left`
                    : `Due ${new Date(job.slaDueAt).toLocaleDateString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Status badge for non-available jobs */}
        {filter !== "available" && (
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                job.status === "COMPLETED"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {job.status === "COMPLETED" ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {(job.status ?? "").replace("_", " ")}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};

export default function AppraiserJobsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as JobFilter | null;
  const isOnline = useOnlineStatus();

  const [filter, setFilter] = useState<JobFilter>(
    tabFromUrl && ["available", "active", "completed"].includes(tabFromUrl)
      ? tabFromUrl
      : "available",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("distance");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    maxDistance: null,
    minPayout: null,
    jobType: null,
  });
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null);

  // Client-side timestamp for hydration safety
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Initial sync on mount - required for hydration safety
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync filter with URL changes
  useEffect(() => {
    if (
      tabFromUrl &&
      ["available", "active", "completed"].includes(tabFromUrl) &&
      tabFromUrl !== filter
    ) {
      // Only update if URL tab differs from current filter
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilter(tabFromUrl);
    }
  }, [tabFromUrl, filter]);

  const hasActiveFilters =
    advancedFilters.maxDistance !== null ||
    advancedFilters.minPayout !== null ||
    advancedFilters.jobType !== null;

  const clearFilters = () => {
    setAdvancedFilters({ maxDistance: null, minPayout: null, jobType: null });
  };

  // tRPC utils for invalidation
  const utils = trpc.useUtils();

  // Queries
  const { data: availableJobs, isLoading: availableLoading } =
    trpc.job.available.useQuery(
      {
        limit: 20,
        maxDistance: advancedFilters.maxDistance ?? undefined,
        minPayout: advancedFilters.minPayout ?? undefined,
        jobType: advancedFilters.jobType ?? undefined,
      },
      {
        enabled: filter === "available",
        staleTime: 2 * 60 * 1000, // 2 min
        refetchOnWindowFocus: true,
        retry: isOnline ? 3 : 0,
      },
    );

  const { data: activeJobs } = trpc.job.myActive.useQuery(undefined, {
    enabled: filter === "active",
    staleTime: 60 * 1000,
    retry: isOnline ? 3 : 0,
  });

  const { data: completedJobs } = trpc.job.history.useQuery(
    { limit: 20 },
    {
      enabled: filter === "completed",
      staleTime: 5 * 60 * 1000,
      retry: isOnline ? 3 : 0,
    },
  );

  // Mutations
  const skipJob = trpc.job.skip.useMutation({
    onSuccess: () => {
      utils.job.available.invalidate();
      toast({
        title: "Job skipped",
        description: "This job won't appear for 24 hours.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to skip job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const acceptJob = trpc.job.accept.useMutation({
    onSuccess: () => {
      utils.job.available.invalidate();
      utils.job.myActive.invalidate();
      setAcceptingJobId(null);
      toast({
        title: "Job accepted!",
        description: "Check your Active Jobs to start working.",
      });
      // Haptic success
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    },
    onError: (error) => {
      setAcceptingJobId(null);
      toast({
        title: "Failed to accept job",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSkip = (jobId: string) => {
    skipJob.mutate({ jobId });
  };

  const handleAccept = (jobId: string) => {
    setAcceptingJobId(jobId);
    acceptJob.mutate({ jobId });
  };

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      utils.job.available.invalidate(),
      utils.job.myActive.invalidate(),
      utils.job.history.invalidate(),
    ]);
  }, [utils]);

  const { isRefreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: viewMode === "map",
  });

  // Get sorted jobs
  const jobs = useMemo(() => {
    const baseJobs =
      filter === "available"
        ? availableJobs
        : filter === "active"
          ? activeJobs
          : completedJobs?.items;

    if (!baseJobs) return [];

    return [...baseJobs].sort((a, b) => {
      if (sortBy === "distance" && "distance" in a && "distance" in b) {
        return (
          (Number((a as { distance?: number }).distance) || 0) -
          (Number((b as { distance?: number }).distance) || 0)
        );
      }
      if (sortBy === "payout") {
        return Number(b.payoutAmount) - Number(a.payoutAmount);
      }
      if (sortBy === "urgency") {
        const aTime = a.slaDueAt ? new Date(a.slaDueAt).getTime() : Infinity;
        const bTime = b.slaDueAt ? new Date(b.slaDueAt).getTime() : Infinity;
        return aTime - bTime;
      }
      return 0;
    });
  }, [filter, availableJobs, activeJobs, completedJobs?.items, sortBy]);

  const isLoadingJobs = filter === "available" && availableLoading;

  return (
    <div className="space-y-4 ">
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center bg-[var(--primary)]/90 text-white transition-all"
          style={{
            height: Math.min(pullDistance, 60),
            opacity: progress,
          }}
        >
          <RefreshCw
            className={`w-5 h-5 mr-2 ${progress >= 1 ? "animate-spin" : ""}`}
          />
          <span className="text-sm font-medium">
            {progress >= 1 ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      )}

      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-3 bg-[var(--primary)] text-black font-medium">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm font-medium">Refreshing jobs...</span>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 flex items-center gap-3">
          <WifiOff className="w-6 h-6 text-orange-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-orange-400">You&apos;re offline</p>
            <p className="text-sm text-orange-400/80">
              Showing cached jobs. Some features may be unavailable.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Jobs</h1>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-[var(--muted)] rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "map"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Map view"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              hasActiveFilters
                ? "bg-[var(--primary)] text-black font-medium"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* Swipe Hint for Mobile */}
      {filter === "available" && viewMode === "list" && jobs.length > 0 && (
        <div className="bg-[var(--muted)] rounded-lg p-3 flex items-center justify-center gap-4 text-sm text-[var(--muted-foreground)] md:hidden">
          <span className="flex items-center gap-1">
            <span className="text-green-400">←</span> Swipe right to accept
          </span>
          <span className="text-[var(--border)]">|</span>
          <span className="flex items-center gap-1">
            Swipe left to skip <span className="text-red-400">→</span>
          </span>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && filter === "available" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--foreground)]">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Max Distance
              </label>
              <select
                value={advancedFilters.maxDistance ?? ""}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    maxDistance: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Any distance</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="15">Within 15 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Min Payout
              </label>
              <select
                value={advancedFilters.minPayout ?? ""}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    minPayout: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Any amount</option>
                <option value="50">$50+</option>
                <option value="100">$100+</option>
                <option value="150">$150+</option>
                <option value="200">$200+</option>
                <option value="300">$300+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-2">
                Job Type
              </label>
              <select
                value={advancedFilters.jobType ?? ""}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    jobType: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">All types</option>
                <option value="ONSITE_PHOTOS">On-site Photos</option>
                <option value="CERTIFIED_APPRAISAL">Certified Appraisal</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          {
            id: "available",
            label: "Available",
            count: availableJobs?.length || 0,
            icon: Briefcase,
          },
          {
            id: "active",
            label: "Active",
            count: activeJobs?.length || 0,
            icon: Zap,
          },
          {
            id: "completed",
            label: "Completed",
            count: completedJobs?.items?.length || 0,
            icon: CheckCircle,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as JobFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-colors ${
              filter === tab.id
                ? "bg-[var(--primary)] text-black font-medium"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                filter === tab.id ? "bg-white/20" : "bg-[var(--secondary)]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sort Chips */}
      {filter === "available" && jobs.length > 0 && viewMode === "list" && (
        <div className="flex gap-2 items-center overflow-x-auto pb-1">
          <ArrowUpDown className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
          {[
            { id: "distance", label: "Nearest", icon: Navigation },
            { id: "payout", label: "Highest Pay", icon: DollarSign },
            { id: "urgency", label: "Most Urgent", icon: Clock },
          ].map((sort) => (
            <button
              key={sort.id}
              onClick={() => setSortBy(sort.id as SortBy)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                sortBy === sort.id
                  ? "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              <sort.icon className="w-3.5 h-3.5" />
              {sort.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoadingJobs && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Map View */}
      {!isLoadingJobs && viewMode === "map" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Map className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
                No Jobs on Map
              </h3>
              <p className="text-[var(--muted-foreground)]">
                {filter === "available"
                  ? "No available jobs in your area. Try expanding your filters."
                  : "No jobs to display in this view."}
              </p>
            </div>
          ) : (
            <>
              <MapView
                style={{ height: 450 }}
                markers={jobs
                  .filter(
                    (job) => job.property?.latitude && job.property?.longitude,
                  )
                  .map((job) => ({
                    id: job.id,
                    latitude: job.property?.latitude ?? 0,
                    longitude: job.property?.longitude ?? 0,
                    label: job.property?.addressLine1 || "Job Location",
                    color:
                      filter === "available"
                        ? "#22c55e"
                        : filter === "active"
                          ? "#eab308"
                          : "#6b7280",
                  }))}
                showBaseLayerSwitcher
              />
              {/* Job list below map */}
              <div className="max-h-[250px] overflow-y-auto divide-y divide-[var(--border)]">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/appraiser/jobs/${job.id}`}
                    className="flex items-center justify-between p-4 hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          filter === "available"
                            ? "bg-green-500"
                            : filter === "active"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {job.property?.addressLine1}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {job.property?.city}, {job.property?.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-green-400">
                        ${Number(job.payoutAmount)}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* List View */}
      {!isLoadingJobs && viewMode === "list" && (
        <>
          {jobs.length === 0 ? (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  filter === "available"
                    ? "bg-green-500/20"
                    : filter === "active"
                      ? "bg-yellow-500/20"
                      : "bg-[var(--muted)]"
                }`}
              >
                {filter === "available" && (
                  <Briefcase className="w-10 h-10 text-green-400" />
                )}
                {filter === "active" && (
                  <Zap className="w-10 h-10 text-yellow-400" />
                )}
                {filter === "completed" && (
                  <CheckCircle className="w-10 h-10 text-[var(--muted-foreground)]" />
                )}
              </div>

              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                {filter === "available" && "No Jobs Available"}
                {filter === "active" && "No Active Jobs"}
                {filter === "completed" && "No Completed Jobs Yet"}
              </h3>

              <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                {filter === "available" &&
                  "There are currently no jobs in your area. Try expanding your search radius or check back in a few hours."}
                {filter === "active" &&
                  "You don't have any jobs in progress. Browse available jobs to get started!"}
                {filter === "completed" &&
                  "Complete your first job to see your work history here. Your earnings and stats will appear once you finish a job."}
              </p>

              {/* Contextual CTAs */}
              {filter === "available" && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setAdvancedFilters({
                        ...advancedFilters,
                        maxDistance: 50,
                      });
                      toast({
                        title: "Search expanded",
                        description: "Now showing jobs within 50 miles.",
                      });
                    }}
                    className="px-6 py-3 bg-[var(--primary)] text-black font-medium rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors"
                  >
                    <Navigation className="w-4 h-4 inline mr-2" />
                    Expand to 50 Miles
                  </button>
                  <button
                    onClick={() => setShowFilters(true)}
                    className="px-6 py-3 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--secondary)] transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 inline mr-2" />
                    Adjust Filters
                  </button>
                </div>
              )}

              {filter === "active" && (
                <button
                  onClick={() => setFilter("available")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-black font-medium rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors"
                >
                  <Briefcase className="w-5 h-5" />
                  Browse Available Jobs
                </button>
              )}

              {filter === "completed" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <TrendingUp className="w-5 h-5" />
                    <span>Complete jobs to track your earnings</span>
                  </div>
                  <button
                    onClick={() => setFilter("available")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-black font-medium rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors"
                  >
                    <Briefcase className="w-5 h-5" />
                    Find Your First Job
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <SwipeableJobCard
                  key={job.id}
                  job={job}
                  filter={filter}
                  onSkip={handleSkip}
                  onAccept={handleAccept}
                  isSkipping={skipJob.isPending}
                  isAccepting={acceptingJobId === job.id && acceptJob.isPending}
                  now={now}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Quick Stats Footer */}
      {filter === "available" && jobs.length > 0 && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-[var(--foreground)]">
                  <strong>
                    ${jobs.reduce((sum, j) => sum + Number(j.payoutAmount), 0)}
                  </strong>{" "}
                  available
                </span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-[var(--foreground)]">
                  <strong>
                    {now !== null
                      ? jobs.filter((j) => {
                          if (!j.slaDueAt) return false;
                          const hrs =
                            (new Date(j.slaDueAt).getTime() - now) /
                            (1000 * 60 * 60);
                          return hrs < 24 && hrs > 0;
                        }).length
                      : 0}
                  </strong>{" "}
                  due soon
                </span>
              </div>
            </div>
            <Link
              href="/appraiser/earnings"
              className="text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              View Earnings
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
