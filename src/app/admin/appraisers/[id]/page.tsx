"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/components/ui/Button";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Briefcase,
  Award,
} from "lucide-react";

export default function AppraiserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const userId = params.id as string;

  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, isLoading, refetch } = trpc.admin.appraisers.getById.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const verifyLicense = trpc.appraiser.license.verify.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "License updated",
        description: "The appraiser license status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update license status",
        variant: "destructive",
      });
    },
  });

  const suspendAppraiser = trpc.admin.appraisers.suspend.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Appraiser suspended",
        description: "The appraiser has been suspended successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend appraiser",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    verifyLicense.mutate({ userId, action: "APPROVE" });
  };

  const handleReject = () => {
    if (!rejectionReason) return;
    verifyLicense.mutate({ userId, action: "REJECT", notes: rejectionReason });
    setShowRejectModal(false);
  };

  const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    PENDING: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Pending Verification" },
    VERIFIED: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Verified" },
    EXPIRED: { color: "bg-orange-500/20 text-orange-400", icon: Clock, label: "License Expired" },
    REVOKED: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Revoked" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Appraiser not found</h2>
        <Link href="/admin/appraisers" className="text-[var(--primary)] hover:underline mt-2 inline-block">
          Back to appraisers
        </Link>
      </div>
    );
  }

  const { profile, recentJobs, stats } = data;
  const status = statusConfig[profile.verificationStatus];
  const StatusIcon = status?.icon || Clock;
  const isPending = profile.verificationStatus === "PENDING";

  // Calculate stats from job data
  const completedJobsCount = stats.find(s => s.status === "COMPLETED")?._count || 0;

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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {profile.user?.firstName} {profile.user?.lastName}
          </h1>
          <p className="text-[var(--muted-foreground)]">Appraiser Profile</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${status?.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status?.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Email</p>
                  <p className="font-medium text-[var(--foreground)]">{profile.user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Phone</p>
                  <p className="font-medium text-[var(--foreground)]">{profile.user?.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Completed Jobs</p>
                  <p className="font-medium text-[var(--foreground)]">{profile.completedJobs || 0}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Member Since</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {profile.verificationNotes && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">Verification Notes</p>
                <p className="text-[var(--muted-foreground)]">{profile.verificationNotes}</p>
              </div>
            )}
          </div>

          {/* License Info */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">License Information</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">License Number</p>
                  <p className="font-mono font-medium text-[var(--foreground)]">{profile.licenseNumber || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">License Type</p>
                  <p className="font-medium text-[var(--foreground)]">{profile.licenseType?.replace(/_/g, " ") || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">License State</p>
                  <p className="font-medium text-[var(--foreground)]">{profile.licenseState || "TX"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Expiry Date</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {profile.licenseExpiry
                      ? new Date(profile.licenseExpiry).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Area */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Coverage Area</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Home Base Coordinates</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {profile.homeBaseLat?.toFixed(4)}, {profile.homeBaseLng?.toFixed(4)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">Coverage Radius</p>
                <p className="font-medium text-[var(--foreground)]">{profile.coverageRadiusMiles || 25} miles</p>
              </div>
            </div>
          </div>

          {/* Verification Actions */}
          {isPending && (
            <div className="bg-yellow-500/10 rounded-lg border border-yellow-500/30 p-6">
              <h2 className="text-lg font-semibold text-yellow-400 mb-4">Pending Verification</h2>
              <p className="text-yellow-300 mb-4">
                This appraiser is waiting for license verification. Please review their credentials and approve or reject.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={verifyLicense.isPending}
                >
                  {verifyLicense.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve License
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Recent Jobs */}
          {recentJobs.length > 0 && (
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent Jobs</h2>
              <div className="space-y-3">
                {recentJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{job.property?.addressFull || "Unknown property"}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">Job #{job.jobNumber}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                      job.status === "IN_PROGRESS" ? "bg-blue-500/20 text-blue-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>
                      {job.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Rating</span>
                <span className="flex items-center gap-1 font-medium text-[var(--foreground)]">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {profile.rating ? Number(profile.rating).toFixed(1) : "5.0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Completed Jobs</span>
                <span className="font-medium text-[var(--foreground)]">{completedJobsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Total Jobs</span>
                <span className="font-medium text-[var(--foreground)]">{recentJobs.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/jobs?appraiserId=${userId}`}
                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg block"
              >
                View All Jobs
              </Link>
              <button
                onClick={() => {
                  toast({
                    title: "Feature in development",
                    description: "In-app messaging is coming soon. You can reach the appraiser via email.",
                  });
                }}
                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg"
              >
                Send Message
              </button>
              {profile.verificationStatus === "VERIFIED" && (
                <button
                  onClick={() => {
                    suspendAppraiser.mutate({
                      userId,
                      reason: "Suspended by admin from profile page",
                    });
                  }}
                  disabled={suspendAppraiser.isPending}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                >
                  {suspendAppraiser.isPending ? "Suspending..." : "Suspend Appraiser"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Reject Verification</h3>
            <p className="text-[var(--muted-foreground)] mb-4">
              Please provide a reason for rejecting this appraiser&apos;s license verification.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
