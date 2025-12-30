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
} from "lucide-react";

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

  const { data: dispute, isLoading, refetch } = trpc.dispute.getById.useQuery(
    { id: disputeId },
    { enabled: !!disputeId }
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
    resolveDispute.mutate({
      disputeId,
      resolution,
      refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
    });
  };

  const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    OPEN: { color: "bg-yellow-500/20 text-yellow-400", icon: AlertTriangle, label: "Open" },
    UNDER_REVIEW: { color: "bg-blue-500/20 text-blue-400", icon: Clock, label: "Under Review" },
    RESOLVED: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Resolved" },
    ESCALATED: { color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle, label: "Escalated" },
    CLOSED: { color: "bg-gray-500/20 text-gray-400", icon: XCircle, label: "Closed" },
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
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Dispute not found</h2>
        <Link href="/admin/disputes" className="text-[var(--primary)] hover:underline mt-2 inline-block">
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[var(--muted)] rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{dispute.subject}</h1>
          <p className="text-[var(--muted-foreground)]">
            Dispute #{dispute.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${status?.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status?.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Description</h2>
            <p className="text-[var(--muted-foreground)] whitespace-pre-wrap">{dispute.description}</p>
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
                          {(comment.author.role === "ADMIN" || comment.author.role === "SUPER_ADMIN") && (
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
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Related Job</h2>
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

          {/* Resolution Form */}
          {isOpen && (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Resolve Dispute</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Resolution Notes *
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                    placeholder="Describe how this dispute was resolved..."
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Refund Amount (optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleResolve}
                    disabled={!resolution || resolveDispute.isPending}
                  >
                    {resolveDispute.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve Dispute
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => escalateDispute.mutate({ disputeId, reason: "Manual escalation" })}
                    disabled={escalateDispute.isPending}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Info (if resolved) */}
          {dispute.resolution && (
            <div className="bg-green-500/10 rounded-lg border border-green-500/30 p-6">
              <h2 className="text-lg font-semibold text-green-400 mb-2">Resolution</h2>
              <p className="text-green-300">{dispute.resolution}</p>
              {dispute.refundAmount && (
                <p className="mt-2 text-green-400 font-medium">
                  Refund: ${dispute.refundAmount.toFixed(2)}
                </p>
              )}
              {dispute.resolvedAt && (
                <p className="mt-2 text-sm text-green-400">
                  Resolved on {new Date(dispute.resolvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Category</p>
                <p className="font-medium text-[var(--foreground)]">{dispute.category?.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Organization</p>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <p className="font-medium text-[var(--foreground)]">{dispute.organization?.name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Submitted</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <p className="font-medium text-[var(--foreground)]">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Priority</p>
                <p className="font-medium text-[var(--foreground)]">
                  {dispute.priority === 1 ? "Critical" :
                   dispute.priority && dispute.priority <= 3 ? "High" :
                   dispute.priority && dispute.priority <= 5 ? "Medium" : "Normal"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          {isOpen && (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => closeDispute.mutate({ disputeId })}
                  disabled={closeDispute.isPending}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg"
                >
                  Close without resolution
                </button>
                <button
                  onClick={() => escalateDispute.mutate({ disputeId, reason: "Needs senior review" })}
                  disabled={escalateDispute.isPending}
                  className="w-full px-4 py-2 text-left text-sm text-orange-400 hover:bg-orange-500/10 rounded-lg"
                >
                  Escalate to senior admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
