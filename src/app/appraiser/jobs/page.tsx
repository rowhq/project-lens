"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  MapPin,
  Clock,
  DollarSign,
  Filter,
  ChevronRight,
  Briefcase,
  CheckCircle,
  Navigation,
  Calendar,
} from "lucide-react";

type JobFilter = "available" | "active" | "completed";

export default function AppraiserJobsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<JobFilter>("available");

  // Available jobs query - returns array directly
  const { data: availableJobs } = trpc.job.available.useQuery(
    { limit: 20 },
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

  // Get the correct jobs list based on filter
  const jobs = filter === "available"
    ? availableJobs
    : filter === "active"
      ? activeJobs
      : completedJobs?.items;

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Jobs</h1>
        <button
          onClick={() => {
            toast({
              title: "Advanced Filters",
              description: "Distance, payout range, and property type filters are in development. Use the tabs above to filter by status.",
            });
          }}
          className="p-2 bg-[var(--muted)] rounded-lg md:hidden hover:bg-[var(--secondary)]"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

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

      {/* Jobs List */}
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
                <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
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
    </div>
  );
}
