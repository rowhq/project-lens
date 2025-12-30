"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Building2,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function AdminJobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { toast } = useToast();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    data: job,
    isLoading,
    refetch,
  } = trpc.admin.jobs.getById.useQuery({ id });

  const cancelJob = trpc.admin.jobs.cancel.useMutation({
    onSuccess: () => {
      refetch();
      setShowCancelDialog(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Job not found
        </h2>
        <Link href="/admin/jobs" className="text-[var(--primary)] mt-2 block">
          Back to jobs
        </Link>
      </div>
    );
  }

  const status = statusConfig[job.status] || statusConfig.PENDING_DISPATCH;
  const StatusIcon = status.icon;
  const isActive = !["COMPLETED", "CANCELLED", "FAILED"].includes(job.status);
  const isBreach =
    job.slaDueAt &&
    new Date(job.slaDueAt) < new Date() &&
    ["DISPATCHED", "ACCEPTED", "IN_PROGRESS"].includes(job.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/jobs"
            className="p-2 hover:bg-[var(--secondary)] rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Job Details
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              ID: {job.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}
          >
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
          {isActive && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/10"
            >
              Cancel Job
            </button>
          )}
        </div>
      </div>

      {/* SLA Breach Warning */}
      {isBreach && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <div>
            <p className="font-medium text-red-400">SLA Breach</p>
            <p className="text-sm text-red-300">
              This job has exceeded its SLA deadline. Immediate action required.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--muted-foreground)]" />
              Property Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Address</p>
                <p className="font-medium text-[var(--foreground)]">
                  {job.property?.addressFull || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">City</p>
                <p className="font-medium text-[var(--foreground)]">
                  {job.property?.city || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">County</p>
                <p className="font-medium text-[var(--foreground)]">
                  {job.property?.county || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Property Type
                </p>
                <p className="font-medium text-[var(--foreground)]">
                  {job.property?.propertyType || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--muted-foreground)]" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Created</span>
                <span className="text-[var(--foreground)]">
                  {new Date(job.createdAt).toLocaleString()}
                </span>
              </div>
              {job.slaDueAt && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">SLA Due</span>
                  <span
                    className={isBreach ? "text-red-400" : "text-[var(--foreground)]"}
                  >
                    {new Date(job.slaDueAt).toLocaleString()}
                  </span>
                </div>
              )}
              {job.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted-foreground)]">Completed</span>
                  <span className="text-green-400">
                    {new Date(job.completedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence */}
          {job.evidence && job.evidence.length > 0 && (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[var(--muted-foreground)]" />
                Evidence ({job.evidence.length} items)
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {job.evidence.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square bg-[var(--muted)] rounded-lg flex items-center justify-center"
                  >
                    <ImageIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Organization */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--muted-foreground)]" />
              Organization
            </h2>
            <p className="font-medium text-[var(--foreground)]">
              {job.organization?.name || "N/A"}
            </p>
          </div>

          {/* Appraiser */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--muted-foreground)]" />
              Assigned Appraiser
            </h2>
            {job.assignedAppraiser ? (
              <div className="space-y-3">
                <p className="font-medium text-[var(--foreground)]">
                  {job.assignedAppraiser.firstName} {job.assignedAppraiser.lastName}
                </p>
                {job.assignedAppraiser.email && (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Mail className="w-4 h-4" />
                    {job.assignedAppraiser.email}
                  </div>
                )}
                {job.assignedAppraiser.phone && (
                  <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Phone className="w-4 h-4" />
                    {job.assignedAppraiser.phone}
                  </div>
                )}
                <Link
                  href={`/admin/appraisers/${job.assignedAppraiserId}`}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  View Profile
                </Link>
              </div>
            ) : (
              <p className="text-[var(--muted-foreground)]">Not assigned</p>
            )}
          </div>

          {/* Financial */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[var(--muted-foreground)]" />
              Financial
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">Payout Amount</span>
                <span className="font-medium text-[var(--foreground)]">
                  ${Number(job.payoutAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Report */}
          {job.appraisalRequest?.report && (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
                Report
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Report ID: {job.appraisalRequest.report.id}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
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
                  setShowCancelDialog(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!cancelReason.trim()) {
                    toast({
                      title: "Reason required",
                      description: "Please provide a reason for cancellation",
                      variant: "destructive",
                    });
                    return;
                  }
                  cancelJob.mutate({ jobId: job.id, reason: cancelReason });
                }}
                disabled={cancelJob.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelJob.isPending ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
