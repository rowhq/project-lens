"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Briefcase,
  CheckCircle,
  Navigation,
  Calendar,
  X,
  Loader2,
  SlidersHorizontal,
  Map,
  List,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import MapView to avoid SSR issues with MapLibre
const MapView = dynamic(
  () => import("@/shared/components/common/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-[500px] bg-[var(--muted)] rounded-lg animate-pulse" /> }
);

type JobFilter = "available" | "active" | "completed";
type ViewMode = "list" | "map";

interface AdvancedFilters {
  maxDistance: number | null;
  minPayout: number | null;
  jobType: string | null;
}

export default function AppraiserJobsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as JobFilter | null;
  const [filter, setFilter] = useState<JobFilter>(
    tabFromUrl && ["available", "active", "completed"].includes(tabFromUrl)
      ? tabFromUrl
      : "available"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    maxDistance: null,
    minPayout: null,
    jobType: null,
  });

  // Sync filter with URL when it changes
  useEffect(() => {
    if (tabFromUrl && ["available", "active", "completed"].includes(tabFromUrl)) {
      setFilter(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Check if any advanced filter is active
  const hasActiveFilters = advancedFilters.maxDistance !== null ||
    advancedFilters.minPayout !== null ||
    advancedFilters.jobType !== null;

  const clearFilters = () => {
    setAdvancedFilters({ maxDistance: null, minPayout: null, jobType: null });
  };

  // Available jobs query - returns array directly with server-side filters
  const { data: availableJobs, isLoading: availableLoading } = trpc.job.available.useQuery(
    {
      limit: 20,
      maxDistance: advancedFilters.maxDistance ?? undefined,
      minPayout: advancedFilters.minPayout ?? undefined,
      jobType: advancedFilters.jobType ?? undefined,
    },
    { enabled: filter === "available" }
  );

  // Active jobs (ACCEPTED or IN_PROGRESS)
  const { data: activeJobs } = trpc.job.myActive.useQuery(
    undefined,
    { enabled: filter === "active" }
  );

  // Completed jobs history
  const { data: completedJobs } = trpc.job.history.useQuery(
    { limit: 20 },
    { enabled: filter === "completed" }
  );

  // Skip job mutation
  const utils = trpc.useUtils();
  const skipJob = trpc.job.skip.useMutation({
    onSuccess: () => {
      utils.job.available.invalidate();
      toast({
        title: "Job skipped",
        description: "This job won't appear for 24 hours. You can still see it on the job details page.",
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

  const handleSkip = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    skipJob.mutate({ jobId });
  };

  // Get the correct jobs list based on filter (filtering is now server-side for available jobs)
  const jobs = useMemo(() => {
    return filter === "available"
      ? availableJobs
      : filter === "active"
        ? activeJobs
        : completedJobs?.items;
  }, [filter, availableJobs, activeJobs, completedJobs?.items]);

  // Show loading state when filters change
  const isLoadingJobs = filter === "available" && availableLoading;

  return (
    <div className="space-y-4 pb-20 md:pb-6">
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
                ? "bg-[var(--primary)] text-white"
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

      {/* Advanced Filters Panel */}
      {showFilters && filter === "available" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--foreground)]">Advanced Filters</h3>
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
            {/* Max Distance */}
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
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Any distance</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="15">Within 15 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
              </select>
            </div>

            {/* Min Payout */}
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
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Any amount</option>
                <option value="50">$50+</option>
                <option value="100">$100+</option>
                <option value="150">$150+</option>
                <option value="200">$200+</option>
                <option value="300">$300+</option>
              </select>
            </div>

            {/* Job Type */}
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
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">All types</option>
                <option value="ONSITE_PHOTOS">On-site Photos</option>
                <option value="CERTIFIED_APPRAISAL">Certified Appraisal</option>
              </select>
            </div>
          </div>

          {/* Active filter count */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Showing {jobs?.length || 0} of {availableJobs?.length || 0} available jobs
              </span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-[var(--primary)] hover:underline"
              >
                Apply & close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info when filters active but not on available tab */}
      {showFilters && filter !== "available" && (
        <div className="bg-[var(--muted)] rounded-lg p-4 text-sm text-[var(--muted-foreground)]">
          <p>Advanced filters are only available for the &quot;Available&quot; tab.</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "available", label: "Available", count: availableJobs?.length || 0 },
          { id: "active", label: "Active", count: activeJobs?.length || 0 },
          { id: "completed", label: "Completed", count: completedJobs?.items?.length || 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as JobFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filter === tab.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                filter === tab.id ? "bg-[var(--primary)]/80" : "bg-[var(--secondary)]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading indicator for filter changes */}
      {isLoadingJobs && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Map View */}
      {!isLoadingJobs && viewMode === "map" && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
          {jobs?.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No Jobs Found</h3>
              <p className="text-[var(--muted-foreground)]">
                {filter === "available"
                  ? "No available jobs in your area right now. Check back soon!"
                  : filter === "active"
                  ? "You don't have any active jobs."
                  : "You haven't completed any jobs yet."}
              </p>
            </div>
          ) : (
            <MapView
              style={{ height: 500 }}
              markers={jobs
                ?.filter((job) => job.property?.latitude && job.property?.longitude)
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
          )}
          {/* Job list below map */}
          {jobs && jobs.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto divide-y divide-[var(--border)]">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/appraiser/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 hover:bg-[var(--muted)] transition-colors"
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
                      <p className="font-medium text-[var(--foreground)] text-sm">
                        {job.property?.addressLine1}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {job.property?.city}, {job.property?.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-green-400 text-sm">
                      ${Number(job.payoutAmount)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {!isLoadingJobs && viewMode !== "map" && (
        <>
          {jobs?.length === 0 ? (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No Jobs Found</h3>
              <p className="text-[var(--muted-foreground)]">
                {filter === "available"
                  ? "No available jobs in your area right now. Check back soon!"
                  : filter === "active"
                  ? "You don't have any active jobs."
                  : "You haven't completed any jobs yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs?.map((job) => (
                <Link
                  key={job.id}
                  href={`/appraiser/jobs/${job.id}`}
                  className="block bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 hover:border-[var(--muted-foreground)] transition-colors"
                >
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
                      <div>
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {job.property?.addressLine1}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {job.property?.city}, {job.property?.state} {job.property?.zipCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {filter === "available" && (
                        <button
                          onClick={(e) => handleSkip(e, job.id)}
                          disabled={skipJob.isPending}
                          className="p-2 rounded-lg bg-[var(--muted)] hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Skip this job for 24 hours"
                        >
                          {skipJob.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-green-400">${Number(job.payoutAmount)}</span>
                    </div>

                    {filter === "available" && "distance" in job && (job as { distance?: number }).distance && (
                      <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                        <Navigation className="w-4 h-4" />
                        <span>{((job as { distance?: number }).distance ?? 0).toFixed(1)} mi</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                      <Clock className="w-4 h-4" />
                      <span>{job.jobType?.replace("_", " ")}</span>
                    </div>

                    {job.slaDueAt && (
                      <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                        <Calendar className="w-4 h-4" />
                        <span>Due {new Date(job.slaDueAt).toLocaleDateString()}</span>
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
                        {job.status.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
