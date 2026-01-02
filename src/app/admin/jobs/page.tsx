"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  Building2,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Briefcase,
  ThumbsUp,
  Square,
  CheckSquare,
} from "lucide-react";
import { EmptyState } from "@/shared/components/common/EmptyState";

type JobStatus =
  | "PENDING_DISPATCH"
  | "DISPATCHED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "ALL";

export default function AdminJobsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus>("ALL");
  const [slaBreach, setSlaBreach] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingJob, setCancellingJob] = useState<string | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showBulkCancelDialog, setShowBulkCancelDialog] = useState(false);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [bulkReason, setBulkReason] = useState("");

  const {
    data: jobsData,
    isLoading,
    refetch,
  } = trpc.admin.jobs.list.useQuery({
    limit: 50,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    slaBreach: slaBreach || undefined,
  });
  const jobs = jobsData?.items;

  const cancelJob = trpc.admin.jobs.cancel.useMutation({
    onSuccess: () => {
      refetch();
      setCancellingJob(null);
      setCancelReason("");
      toast({
        title: "Job cancelled",
        description: "The job has been cancelled successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel job",
        variant: "destructive",
      });
    },
  });

  const bulkCancelMutation = trpc.admin.jobs.bulkCancel.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedJobs(new Set());
      setShowBulkCancelDialog(false);
      setBulkReason("");
      toast({
        title: "Jobs cancelled",
        description: `${data.cancelledCount} job(s) have been cancelled.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel jobs",
        variant: "destructive",
      });
    },
  });

  const bulkApproveMutation = trpc.admin.jobs.bulkApprove.useMutation({
    onSuccess: (data) => {
      refetch();
      setSelectedJobs(new Set());
      setShowBulkApproveDialog(false);
      setBulkReason("");
      toast({
        title: "Jobs approved",
        description: `${data.approvedCount} job(s) have been approved.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve jobs",
        variant: "destructive",
      });
    },
  });

  const statusConfig: Record<
    string,
    { color: string; icon: typeof Clock; label: string }
  > = {
    PENDING_DISPATCH: {
      color: "bg-gray-500/20 text-gray-400",
      icon: Clock,
      label: "Pending Dispatch",
    },
    DISPATCHED: {
      color: "bg-blue-500/20 text-blue-400",
      icon: RefreshCw,
      label: "Dispatched",
    },
    ACCEPTED: {
      color: "bg-cyan-500/20 text-cyan-400",
      icon: CheckCircle,
      label: "Accepted",
    },
    IN_PROGRESS: {
      color: "bg-yellow-500/20 text-yellow-400",
      icon: RefreshCw,
      label: "In Progress",
    },
    SUBMITTED: {
      color: "bg-purple-500/20 text-purple-400",
      icon: CheckCircle,
      label: "Submitted",
    },
    UNDER_REVIEW: {
      color: "bg-orange-500/20 text-orange-400",
      icon: AlertCircle,
      label: "Under Review",
    },
    COMPLETED: {
      color: "bg-green-500/20 text-green-400",
      icon: CheckCircle,
      label: "Completed",
    },
    CANCELLED: {
      color: "bg-red-500/20 text-red-400",
      icon: XCircle,
      label: "Cancelled",
    },
    FAILED: {
      color: "bg-red-500/20 text-red-400",
      icon: AlertTriangle,
      label: "Failed",
    },
  };

  const filteredJobs = jobs?.filter(
    (job) =>
      job.property?.addressFull
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      job.property?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.organization?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      job.assignedAppraiser?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      job.assignedAppraiser?.lastName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCancel = (jobId: string) => {
    if (!cancelReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }
    cancelJob.mutate({ jobId, reason: cancelReason });
  };

  const isSlaBreach = (job: NonNullable<typeof jobs>[number]) => {
    if (!job.slaDueAt) return false;
    const now = new Date();
    const dueAt = new Date(job.slaDueAt);
    return (
      dueAt < now &&
      ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"].includes(job.status)
    );
  };

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const toggleSelectAll = () => {
    if (!filteredJobs) return;
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map((job) => job.id)));
    }
  };

  const selectedJobsCanCancel =
    filteredJobs?.filter(
      (job) =>
        selectedJobs.has(job.id) &&
        !["COMPLETED", "CANCELLED", "FAILED"].includes(job.status),
    ).length || 0;

  const selectedJobsCanApprove =
    filteredJobs?.filter(
      (job) =>
        selectedJobs.has(job.id) &&
        ["SUBMITTED", "UNDER_REVIEW"].includes(job.status),
    ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Jobs</h1>
          <p className="text-[var(--muted-foreground)]">
            Manage and monitor all appraisal jobs
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Total Jobs</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {jobs?.length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">In Progress</p>
          <p className="text-2xl font-bold text-yellow-400">
            {jobs?.filter(
              (j) =>
                j.status === "IN_PROGRESS" ||
                j.status === "ACCEPTED" ||
                j.status === "DISPATCHED",
            ).length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Completed</p>
          <p className="text-2xl font-bold text-green-400">
            {jobs?.filter((j) => j.status === "COMPLETED").length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">Under Review</p>
          <p className="text-2xl font-bold text-orange-400">
            {jobs?.filter(
              (j) => j.status === "SUBMITTED" || j.status === "UNDER_REVIEW",
            ).length || 0}
          </p>
        </div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm text-[var(--muted-foreground)]">SLA Breach</p>
          <p className="text-2xl font-bold text-red-400">
            {jobs?.filter(isSlaBreach).length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by address, city, organization, appraiser..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus)}
            className="border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING_DISPATCH">Pending Dispatch</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        <label className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--secondary)]">
          <input
            type="checkbox"
            checked={slaBreach}
            onChange={(e) => setSlaBreach(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-[var(--foreground)]">
            SLA Breach Only
          </span>
        </label>
      </div>

      {/* Bulk Action Bar */}
      {selectedJobs.size > 0 && (
        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {selectedJobs.size} job{selectedJobs.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <button
              onClick={() => setSelectedJobs(new Set())}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-3">
            {selectedJobsCanApprove > 0 && (
              <button
                onClick={() => setShowBulkApproveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve ({selectedJobsCanApprove})
              </button>
            )}
            {selectedJobsCanCancel > 0 && (
              <button
                onClick={() => setShowBulkCancelDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <XCircle className="w-4 h-4" />
                Cancel ({selectedJobsCanCancel})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={toggleSelectAll}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {filteredJobs &&
                  selectedJobs.size === filteredJobs.length &&
                  filteredJobs.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Appraiser
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                SLA Due
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-[var(--muted-foreground)]"
                >
                  Loading jobs...
                </td>
              </tr>
            ) : filteredJobs?.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Briefcase}
                    title="No jobs found"
                    description="Try adjusting your search or status filters to find jobs"
                  />
                </td>
              </tr>
            ) : (
              filteredJobs?.map((job) => {
                const status =
                  statusConfig[job.status] || statusConfig.PENDING_DISPATCH;
                const StatusIcon = status.icon;
                const breach = isSlaBreach(job);

                return (
                  <tr
                    key={job.id}
                    className={`hover:bg-[var(--secondary)] ${
                      breach ? "bg-red-500/5" : ""
                    } ${selectedJobs.has(job.id) ? "bg-[var(--primary)]/5" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleJobSelection(job.id)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      >
                        {selectedJobs.has(job.id) ? (
                          <CheckSquare className="w-5 h-5 text-[var(--primary)]" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[var(--foreground)] text-sm">
                            {job.property?.addressFull || "Address not set"}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {job.property?.city}, {job.property?.county}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--muted-foreground)]" />
                        <span className="text-sm text-[var(--foreground)]">
                          {job.organization?.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.assignedAppraiser ? (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                          <span className="text-sm text-[var(--foreground)]">
                            {job.assignedAppraiser.firstName}{" "}
                            {job.assignedAppraiser.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--muted-foreground)]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {job.slaDueAt ? (
                        <div
                          className={`flex items-center gap-2 ${
                            breach ? "text-red-400" : "text-[var(--foreground)]"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(job.slaDueAt).toLocaleDateString()}
                          </span>
                          {breach && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--muted-foreground)]">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === job.id ? null : job.id)
                          }
                          className="p-2 hover:bg-[var(--muted)] rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </button>
                        {activeMenu === job.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] py-1 z-10">
                            <Link
                              href={`/admin/jobs/${job.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--secondary)]"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            </Link>
                            {!["COMPLETED", "CANCELLED", "FAILED"].includes(
                              job.status,
                            ) && (
                              <button
                                onClick={() => {
                                  setCancellingJob(job.id);
                                  setActiveMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                              >
                                Cancel Job
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cancel Dialog */}
      {cancellingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg p-6 w-full max-w-md border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Cancel Job
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Please provide a reason for cancelling this job. This action
              cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setCancellingJob(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCancel(cancellingJob)}
                disabled={cancelJob.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelJob.isPending ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Cancel Dialog */}
      {showBulkCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg p-6 w-full max-w-md border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Cancel {selectedJobsCanCancel} Job
              {selectedJobsCanCancel !== 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Please provide a reason for cancelling these jobs. This action
              cannot be undone.
            </p>
            <textarea
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowBulkCancelDialog(false);
                  setBulkReason("");
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!bulkReason.trim()) {
                    toast({
                      title: "Reason required",
                      description: "Please provide a reason for cancellation",
                      variant: "destructive",
                    });
                    return;
                  }
                  const jobsToCancel =
                    filteredJobs
                      ?.filter(
                        (job) =>
                          selectedJobs.has(job.id) &&
                          !["COMPLETED", "CANCELLED", "FAILED"].includes(
                            job.status,
                          ),
                      )
                      .map((job) => job.id) || [];
                  bulkCancelMutation.mutate({
                    jobIds: jobsToCancel,
                    reason: bulkReason,
                  });
                }}
                disabled={bulkCancelMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {bulkCancelMutation.isPending
                  ? "Cancelling..."
                  : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Dialog */}
      {showBulkApproveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg p-6 w-full max-w-md border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Approve {selectedJobsCanApprove} Job
              {selectedJobsCanApprove !== 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Are you sure you want to approve these jobs? This will mark them
              as completed and create payout records for the appraisers.
            </p>
            <textarea
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowBulkApproveDialog(false);
                  setBulkReason("");
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const jobsToApprove =
                    filteredJobs
                      ?.filter(
                        (job) =>
                          selectedJobs.has(job.id) &&
                          ["SUBMITTED", "UNDER_REVIEW"].includes(job.status),
                      )
                      .map((job) => job.id) || [];
                  bulkApproveMutation.mutate({
                    jobIds: jobsToApprove,
                    notes: bulkReason || undefined,
                  });
                }}
                disabled={bulkApproveMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {bulkApproveMutation.isPending
                  ? "Approving..."
                  : "Confirm Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
