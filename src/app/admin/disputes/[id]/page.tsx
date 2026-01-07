"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/components/ui/Button";
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Loader2,
  User,
  Building,
  FileText,
  Calendar,
  Send,
  Lock,
  Scale,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const resolutionOptions = [
  {
    value: "FAVOR_CLIENT",
    label: "In Favor of Client",
    description: "Full refund to client",
  },
  {
    value: "FAVOR_APPRAISER",
    label: "In Favor of Appraiser",
    description: "No refund, work was satisfactory",
  },
  {
    value: "PARTIAL_REFUND",
    label: "Partial Refund",
    description: "Partial compensation to client",
  },
  {
    value: "CREDIT",
    label: "Account Credit",
    description: "Credit towards future orders",
  },
] as const;

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const disputeId = params.id as string;

  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionType, setResolutionType] = useState<
    "FAVOR_CLIENT" | "FAVOR_APPRAISER" | "PARTIAL_REFUND" | "CREDIT"
  >("FAVOR_CLIENT");
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");

  const {
    data: dispute,
    isLoading,
    refetch,
  } = trpc.dispute.getById.useQuery(
    { id: disputeId },
    { enabled: !!disputeId },
  );

  const resolveDispute = trpc.dispute.resolve.useMutation({
    onSuccess: () => {
      refetch();
      setIsResolving(false);
      setResolution("");
      setRefundAmount("");
      toast({
        title: "Dispute resolved",
        description: "The dispute has been resolved successfully.",
      });
    },
    onError: (error) => {
      setIsResolving(false);
      toast({
        title: "Error",
        description: error.message || "Failed to resolve dispute",
        variant: "destructive",
      });
    },
  });

  const escalateDispute = trpc.dispute.escalate.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Dispute escalated",
        description: "The dispute has been escalated for senior review.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to escalate dispute",
        variant: "destructive",
      });
    },
  });

  const closeDispute = trpc.dispute.close.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Dispute closed",
        description: "The dispute has been closed without resolution.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close dispute",
        variant: "destructive",
      });
    },
  });

  const addComment = trpc.dispute.addComment.useMutation({
    onSuccess: () => {
      refetch();
      setNewComment("");
      setIsInternalComment(false);
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate({
      disputeId,
      content: newComment,
      isInternal: isInternalComment,
    });
  };

  const handleResolve = () => {
    if (!resolution) return;
    const selectedOption = resolutionOptions.find(
      (o) => o.value === resolutionType,
    );
    const fullResolution = `${selectedOption?.label}: ${resolution}`;
    resolveDispute.mutate({
      disputeId,
      resolution: fullResolution,
      refundAmount: refundAmount ? parseFloat(refundAmount) * 100 : undefined, // Convert to cents
    });
  };

  const handleEscalate = () => {
    if (!escalateReason) return;
    escalateDispute.mutate({
      disputeId,
      reason: escalateReason,
    });
  };

  const statusConfig: Record<
    string,
    { color: string; icon: React.ElementType; label: string }
  > = {
    OPEN: {
      color: "bg-yellow-500/20 text-yellow-400",
      icon: AlertTriangle,
      label: "Open",
    },
    UNDER_REVIEW: {
      color: "bg-blue-500/20 text-blue-400",
      icon: Clock,
      label: "Under Review",
    },
    RESOLVED: {
      color: "bg-green-500/20 text-green-400",
      icon: CheckCircle,
      label: "Resolved",
    },
    ESCALATED: {
      color: "bg-orange-500/20 text-orange-400",
      icon: AlertTriangle,
      label: "Escalated",
    },
    CLOSED: {
      color: "bg-gray-500/20 text-gray-400",
      icon: XCircle,
      label: "Closed",
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Dispute not found
        </h2>
        <Link
          href="/admin/disputes"
          className="text-[var(--primary)] hover:underline mt-2 inline-block"
        >
          Back to disputes
        </Link>
      </div>
    );
  }

  const status = statusConfig[dispute.status];
  const StatusIcon = status?.icon || AlertTriangle;
  const isOpen = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.back()}
            className="p-2.5 hover:bg-[var(--muted)] rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {dispute.subject}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${status?.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                {status?.label}
              </span>
            </div>
            <p className="text-[var(--muted-foreground)]">
              Dispute #{dispute.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        {/* Action Buttons */}
        {isOpen && (
          <div className="flex items-center gap-2 ml-auto">
            {dispute.status !== "ESCALATED" && (
              <Button
                variant="outline"
                onClick={() => setShowEscalateModal(true)}
                className="gap-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Escalate</span>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => closeDispute.mutate({ disputeId })}
              disabled={closeDispute.isPending}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowResolveModal(true)}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Description
            </h2>
            <p className="text-[var(--muted-foreground)] whitespace-pre-wrap">
              {dispute.description}
            </p>
          </div>

          {/* Comments Thread */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments
              {dispute.comments && dispute.comments.length > 0 && (
                <span className="text-sm font-normal text-[var(--muted-foreground)]">
                  ({dispute.comments.length})
                </span>
              )}
            </h2>

            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {dispute.comments && dispute.comments.length > 0 ? (
                dispute.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      comment.isInternal
                        ? "bg-yellow-500/10 border border-yellow-500/30"
                        : "bg-[var(--muted)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                        {comment.author.avatarUrl ? (
                          <img
                            src={comment.author.avatarUrl}
                            alt={`${comment.author.firstName} ${comment.author.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-[var(--primary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[var(--foreground)]">
                            {comment.author.firstName} {comment.author.lastName}
                          </span>
                          {(comment.author.role === "ADMIN" ||
                            comment.author.role === "SUPER_ADMIN") && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                              Admin
                            </span>
                          )}
                          {comment.isInternal && (
                            <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Internal
                            </span>
                          )}
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[var(--muted-foreground)] whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[var(--muted-foreground)] text-center py-4">
                  No comments yet. Be the first to add a comment.
                </p>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="border-t border-[var(--border)] pt-4">
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] resize-none"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded border-[var(--border)]"
                    />
                    <span className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Internal note (only visible to admins)
                    </span>
                  </label>
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addComment.isPending}
                    size="sm"
                  >
                    {addComment.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Job/Report */}
          {dispute.relatedJob && (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Related Job
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    Job #{dispute.relatedJob.jobNumber}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {dispute.relatedJob.property?.addressFull}
                  </p>
                </div>
                <Link
                  href={`/admin/jobs/${dispute.relatedJob.id}`}
                  className="ml-auto text-[var(--primary)] hover:underline text-sm"
                >
                  View Job
                </Link>
              </div>
            </div>
          )}

          {/* Resolution Info (if resolved) */}
          {dispute.resolution && (
            <div className="bg-green-500/10 rounded-lg border border-green-500/30 p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Resolution
              </h2>
              <p className="text-[var(--foreground)]">{dispute.resolution}</p>
              {dispute.refundAmount && Number(dispute.refundAmount) > 0 && (
                <p className="mt-2 text-green-400 font-medium">
                  Refund: ${(Number(dispute.refundAmount) / 100).toFixed(2)}
                </p>
              )}
              {dispute.resolvedAt && (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Resolved on{" "}
                  {new Date(dispute.resolvedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">
              Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Category
                </p>
                <p className="font-medium text-[var(--foreground)]">
                  {dispute.category?.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Organization
                </p>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <p className="font-medium text-[var(--foreground)]">
                    {dispute.organization?.name}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Submitted
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <p className="font-medium text-[var(--foreground)]">
                    {new Date(dispute.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Priority
                </p>
                <p className="font-medium text-[var(--foreground)]">
                  {dispute.priority === 1
                    ? "Critical"
                    : dispute.priority && dispute.priority <= 3
                      ? "High"
                      : dispute.priority && dispute.priority <= 5
                        ? "Medium"
                        : "Normal"}
                </p>
              </div>
            </div>
          </div>

          {/* Related Job in sidebar for mobile */}
          {dispute.relatedJob && (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 lg:hidden">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                Related Job
              </h3>
              <Link
                href={`/admin/jobs/${dispute.relatedJob.id}`}
                className="flex items-center gap-3 text-[var(--foreground)] hover:text-amber-400"
              >
                <FileText className="w-5 h-5" />
                <span>Job #{dispute.relatedJob.jobNumber}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  Resolve Dispute
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Choose a resolution type and provide details
                </p>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-2.5 hover:bg-[var(--muted)] rounded-lg"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Resolution Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Resolution Type
                </label>
                <div className="space-y-2">
                  {resolutionOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        resolutionType === option.value
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-[var(--border)] hover:border-[var(--muted-foreground)]",
                      )}
                    >
                      <input
                        type="radio"
                        name="resolutionType"
                        value={option.value}
                        checked={resolutionType === option.value}
                        onChange={(e) =>
                          setResolutionType(
                            e.target.value as typeof resolutionType,
                          )
                        }
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {option.label}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Refund Amount */}
              {(resolutionType === "FAVOR_CLIENT" ||
                resolutionType === "PARTIAL_REFUND") && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Refund Amount (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Resolution Notes */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Resolution Notes *
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Explain the resolution decision..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowResolveModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleResolve}
                disabled={!resolution.trim() || resolveDispute.isPending}
              >
                {resolveDispute.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Resolve Dispute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] w-full max-w-md">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Escalate Dispute
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  This will mark the dispute as critical priority
                </p>
              </div>
              <button
                onClick={() => setShowEscalateModal(false)}
                className="p-2.5 hover:bg-[var(--muted)] rounded-lg"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Reason for Escalation *
              </label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Explain why this dispute needs to be escalated..."
                rows={4}
                className="w-full px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEscalate}
                disabled={!escalateReason.trim() || escalateDispute.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {escalateDispute.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Escalate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
