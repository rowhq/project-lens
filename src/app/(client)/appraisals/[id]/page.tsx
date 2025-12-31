"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Home,
  User,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  X,
  Link as LinkIcon,
  Send,
  Check,
  Lock,
  Camera,
  Truck,
} from "lucide-react";
import { Skeleton } from "@/shared/components/ui/Skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

// SLA Progress Tracker Component
function SLAProgressTracker({
  appraisal,
  job,
}: {
  appraisal: {
    status: string;
    requestedType: string;
    createdAt: Date;
  };
  job?: {
    status: string;
    slaDueAt: Date | null;
    startedAt: Date | null;
    submittedAt: Date | null;
  };
}) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      const createdAt = new Date(appraisal.createdAt);

      // Expected hours based on type
      const expectedHours =
        appraisal.requestedType === "AI_REPORT"
          ? 1
          : appraisal.requestedType === "AI_REPORT_WITH_ONSITE"
            ? 48
            : 72;

      const expectedCompletion = new Date(
        createdAt.getTime() + expectedHours * 60 * 60 * 1000,
      );
      const totalDuration = expectedCompletion.getTime() - createdAt.getTime();
      const elapsed = now.getTime() - createdAt.getTime();
      const remaining = expectedCompletion.getTime() - now.getTime();

      // Calculate progress (0-100)
      const progressPct = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100),
      );
      setProgress(progressPct);

      // Calculate time remaining
      if (remaining <= 0) {
        setTimeLeft("Overdue");
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60),
        );
        if (hours >= 24) {
          const days = Math.floor(hours / 24);
          const hrs = hours % 24;
          setTimeLeft(`${days}d ${hrs}h remaining`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m remaining`);
        } else {
          setTimeLeft(`${minutes}m remaining`);
        }
      }
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [appraisal.createdAt, appraisal.requestedType]);

  // Determine current step based on status
  const steps = [
    { id: "submitted", label: "Order Received", complete: true },
    {
      id: "queued",
      label: "In Queue",
      complete: ["QUEUED", "RUNNING", "READY"].includes(appraisal.status),
    },
    {
      id: "processing",
      label: "AI Analysis",
      complete: ["RUNNING", "READY"].includes(appraisal.status),
    },
    ...(appraisal.requestedType !== "AI_REPORT"
      ? [
          {
            id: "inspection",
            label: "On-Site Inspection",
            complete:
              job?.status === "COMPLETED" || appraisal.status === "READY",
          },
        ]
      : []),
    {
      id: "complete",
      label: "Report Ready",
      complete: appraisal.status === "READY",
    },
  ];

  const isOverdue = timeLeft === "Overdue";
  const currentStepIdx = steps.findIndex((s) => !s.complete);

  return (
    <div
      className={`rounded-xl border p-6 ${isOverdue ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isOverdue ? "bg-red-100" : "bg-blue-100"}`}
          >
            <Clock
              className={`w-5 h-5 ${isOverdue ? "text-red-600" : "text-blue-600"}`}
            />
          </div>
          <div>
            <h3
              className={`font-semibold ${isOverdue ? "text-red-900" : "text-blue-900"}`}
            >
              {isOverdue ? "Processing Delayed" : "Processing Your Request"}
            </h3>
            <p
              className={`text-sm ${isOverdue ? "text-red-700" : "text-blue-700"}`}
            >
              {timeLeft}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-bold ${isOverdue ? "text-red-600" : "text-blue-600"}`}
          >
            {Math.round(progress)}%
          </p>
          <p
            className={`text-xs ${isOverdue ? "text-red-600" : "text-blue-600"}`}
          >
            complete
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-500 ${isOverdue ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.complete
                    ? "bg-green-500 text-white"
                    : idx === currentStepIdx
                      ? isOverdue
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.complete ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    step.complete ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-xs text-center ${
                step.complete ? "text-green-700 font-medium" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Current status message */}
      {currentStepIdx >= 0 && currentStepIdx < steps.length && (
        <p
          className={`mt-4 text-sm text-center ${isOverdue ? "text-red-700" : "text-blue-700"}`}
        >
          {appraisal.status === "QUEUED" &&
            "Your request is queued and will be processed shortly."}
          {appraisal.status === "RUNNING" &&
            appraisal.requestedType === "AI_REPORT" &&
            "AI is analyzing property data and comparables..."}
          {appraisal.status === "RUNNING" &&
            appraisal.requestedType !== "AI_REPORT" &&
            (job?.status === "COMPLETED"
              ? "On-site inspection complete. Generating final report..."
              : "AI analysis complete. Waiting for on-site inspection...")}
        </p>
      )}
    </div>
  );
}

// Share Modal Component
function ShareModal({
  isOpen,
  onClose,
  reportId,
}: {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [allowDownload, setAllowDownload] = useState(true);
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareMutation = trpc.report.share.useMutation({
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
    },
  });

  const handleShare = async () => {
    await shareMutation.mutateAsync({
      reportId,
      expiresInDays,
      allowDownload,
      password: usePassword && password ? password : undefined,
    });
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">
            Share Report
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {!shareUrl ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Link Expires In
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allowDownload"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label
                htmlFor="allowDownload"
                className="text-sm text-card-foreground"
              >
                Allow PDF download
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="usePassword"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label
                  htmlFor="usePassword"
                  className="text-sm text-card-foreground"
                >
                  Password protect
                </label>
              </div>
              {usePassword && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                />
              )}
            </div>

            <button
              onClick={handleShare}
              disabled={shareMutation.isPending || (usePassword && !password)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {shareMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Creating Link...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4" />
                  Create Share Link
                </>
              )}
            </button>

            {shareMutation.isError && (
              <p className="text-sm text-destructive text-center">
                Failed to create share link. Please try again.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Share Link</p>
              <p className="text-sm text-card-foreground break-all font-mono">
                {shareUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShareUrl(null);
                  onClose();
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground"
              >
                Done
              </button>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Expires in {expiresInDays} days
              </p>
              {allowDownload && (
                <p className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download enabled
                </p>
              )}
              {usePassword && password && (
                <p className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password protected
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Email Modal Component
function EmailModal({
  isOpen,
  onClose,
  reportId,
}: {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [includeDownload, setIncludeDownload] = useState(true);
  const [sent, setSent] = useState(false);

  const emailMutation = trpc.report.emailReport.useMutation({
    onSuccess: () => {
      setSent(true);
    },
  });

  const handleSend = async () => {
    await emailMutation.mutateAsync({
      reportId,
      recipientEmail,
      message: message || undefined,
      includeDownloadLink: includeDownload,
    });
  };

  const handleClose = () => {
    setRecipientEmail("");
    setMessage("");
    setSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl border border-border w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-card-foreground">
            Email Report
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {!sent ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeDownload"
                checked={includeDownload}
                onChange={(e) => setIncludeDownload(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <label
                htmlFor="includeDownload"
                className="text-sm text-card-foreground"
              >
                Include download link
              </label>
            </div>

            <button
              onClick={handleSend}
              disabled={emailMutation.isPending || !recipientEmail}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {emailMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>

            {emailMutation.isError && (
              <p className="text-sm text-destructive text-center">
                Failed to send email. Please try again.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Email Sent!
            </h3>
            <p className="text-muted-foreground mb-6">
              The report has been sent to {recipientEmail}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppraisalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const {
    data: appraisal,
    isLoading,
    refetch,
  } = trpc.appraisal.getById.useQuery({ id });

  // Payment confirmation mutation
  const confirmPayment = trpc.appraisal.confirmPayment.useMutation({
    onSuccess: () => {
      setPaymentConfirmed(true);
      refetch();
      toast({
        title: "Payment successful!",
        description: "Your appraisal request is now being processed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment confirmation failed",
        description:
          error.message || "Please contact support if you were charged.",
        variant: "destructive",
      });
    },
  });

  // Handle payment success callback from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (
      paymentStatus === "success" &&
      !paymentConfirmed &&
      appraisal?.status === "DRAFT"
    ) {
      confirmPayment.mutate({ appraisalId: id });
    }
  }, [searchParams, id, paymentConfirmed, appraisal?.status, confirmPayment]);

  // Get existing share link
  const { data: existingShareLink } = trpc.report.getShareLink.useQuery(
    { reportId: appraisal?.report?.id || "" },
    { enabled: !!appraisal?.report?.id },
  );

  // Create share link mutation for quick copy
  const shareMutation = trpc.report.share.useMutation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
        {/* Value summary skeleton */}
        <div className="bg-[var(--primary)] rounded-xl p-6">
          <div className="grid grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/20" />
                <Skeleton className="h-8 w-32 bg-white/20" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {/* Property details skeleton */}
          <div className="col-span-2 space-y-6">
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Appraisal not found</p>
        <Link
          href="/appraisals"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Back to appraisals
        </Link>
      </div>
    );
  }

  const report = appraisal.report;
  const property = appraisal.property;

  // Calculate value change vs market using comparable sales average
  // Falls back to mid-range position if comps not available
  const calculateValueChange = () => {
    if (!report?.valueEstimate) return null;

    const estimate = Number(report.valueEstimate);

    // Use comparable sales average if available
    if (
      report.comps &&
      Array.isArray(report.comps) &&
      report.comps.length > 0
    ) {
      const compsWithPrice = (
        report.comps as Array<{ salePrice?: number }>
      ).filter((c) => c.salePrice && c.salePrice > 0);
      if (compsWithPrice.length > 0) {
        const avgCompPrice =
          compsWithPrice.reduce((sum, c) => sum + (c.salePrice || 0), 0) /
          compsWithPrice.length;
        return ((estimate - avgCompPrice) / avgCompPrice) * 100;
      }
    }

    // Fallback: calculate position within value range
    if (report.valueRangeMin && report.valueRangeMax) {
      const min = Number(report.valueRangeMin);
      const max = Number(report.valueRangeMax);
      const mid = (min + max) / 2;
      if (mid > 0) {
        return ((estimate - mid) / mid) * 100;
      }
    }

    return null;
  };

  const valueChange = calculateValueChange();

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    UNDER_REVIEW: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/appraisals" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {appraisal.referenceCode}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appraisal.status]}`}
              >
                {appraisal.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-500">{property?.addressFull}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report?.pdfUrl && (
            <>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <a
                href={report.pdfUrl}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </>
          )}
        </div>
      </div>

      {/* SLA Progress Tracker */}
      {["QUEUED", "RUNNING"].includes(appraisal.status) && (
        <SLAProgressTracker appraisal={appraisal} job={appraisal.jobs?.[0]} />
      )}

      {/* Share Modal */}
      {report && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          reportId={report.id}
        />
      )}

      {/* Email Modal */}
      {report && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          reportId={report.id}
        />
      )}

      {/* Value Summary */}
      {report && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-blue-200 text-sm">Estimated Value</p>
              <p className="text-3xl font-bold">
                ${Number(report.valueEstimate).toLocaleString()}
              </p>
              {valueChange !== null && (
                <div className="flex items-center gap-1 mt-1">
                  {valueChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-300" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" />
                  )}
                  <span
                    className={
                      valueChange >= 0 ? "text-green-300" : "text-red-300"
                    }
                  >
                    {valueChange >= 0 ? "+" : ""}
                    {valueChange.toFixed(1)}% vs comps avg
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-blue-200 text-sm">Value Range</p>
              <p className="text-xl font-semibold">
                ${Number(report.valueRangeMin).toLocaleString()} - $
                {Number(report.valueRangeMax).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Confidence Score</p>
              <p className="text-xl font-semibold">{report.confidenceScore}%</p>
              <div className="w-full bg-blue-800 rounded-full h-2 mt-2">
                <div
                  className="bg-green-400 h-2 rounded-full"
                  style={{ width: `${report.confidenceScore}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Report Type</p>
              <p className="text-xl font-semibold">
                {report.type.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Property Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              Property Details
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-medium text-gray-900">
                  {property?.propertyType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Square Feet</p>
                <p className="font-medium text-gray-900">
                  {property?.sqft?.toLocaleString() || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Year Built</p>
                <p className="font-medium text-gray-900">
                  {property?.yearBuilt || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bedrooms</p>
                <p className="font-medium text-gray-900">
                  {property?.bedrooms || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bathrooms</p>
                <p className="font-medium text-gray-900">
                  {property?.bathrooms || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lot Size</p>
                <p className="font-medium text-gray-900">
                  {property?.lotSizeSqft
                    ? `${(property.lotSizeSqft / 43560).toFixed(2)} acres`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {report?.aiAnalysis && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                AI Analysis
              </h2>
              <p className="text-gray-700 mb-4">
                {(report.aiAnalysis as { summary?: string })?.summary}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {(
                      (report.aiAnalysis as { strengths?: string[] })
                        ?.strengths || []
                    ).map((strength: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Considerations
                  </h3>
                  <ul className="space-y-1">
                    {(
                      (report.aiAnalysis as { concerns?: string[] })
                        ?.concerns || []
                    ).map((concern: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600">
                        • {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Comparable Sales */}
          {report?.comps && Array.isArray(report.comps) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Comparable Sales
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Address
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Sale Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Sq Ft
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Distance
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Match
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(
                      report.comps as Array<{
                        address: string;
                        salePrice: number;
                        sqft: number;
                        distance: number;
                        similarityScore: number;
                      }>
                    )
                      .slice(0, 5)
                      .map((comp, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {comp.address}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ${comp.salePrice?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {comp.sqft?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {comp.distance?.toFixed(1)} mi
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              {comp.similarityScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Risk Flags */}
          {report?.riskFlags &&
            Array.isArray(report.riskFlags) &&
            (
              report.riskFlags as Array<{
                type: string;
                severity: string;
                description: string;
                recommendation: string;
              }>
            ).length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Risk Assessment
                </h2>
                <div className="space-y-3">
                  {(
                    report.riskFlags as Array<{
                      type: string;
                      severity: string;
                      description: string;
                      recommendation: string;
                    }>
                  ).map((risk, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-l-4 ${
                        risk.severity === "HIGH"
                          ? "bg-red-50 border-red-500"
                          : risk.severity === "MEDIUM"
                            ? "bg-yellow-50 border-yellow-500"
                            : "bg-green-50 border-green-500"
                      }`}
                    >
                      <p className="font-medium text-gray-900">
                        {risk.type?.replace(/_/g, " ") ?? "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {risk.description ?? ""}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {risk.recommendation ?? ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Request Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Request Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Requested</p>
                  <p className="font-medium text-gray-900">
                    {new Date(appraisal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium text-gray-900">
                    {appraisal.purpose}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Price Paid</p>
                  <p className="font-medium text-gray-900">
                    ${Number(appraisal.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* On-Site Inspection Status (for AI_REPORT_WITH_ONSITE or CERTIFIED_APPRAISAL) */}
          {appraisal.jobs && appraisal.jobs.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                On-Site Inspection
              </h2>
              {appraisal.jobs.map((job) => {
                const jobStatusConfig: Record<
                  string,
                  { label: string; color: string; icon: typeof Clock }
                > = {
                  PENDING_DISPATCH: {
                    label: "Finding Appraiser",
                    color: "bg-gray-100 text-gray-700",
                    icon: Clock,
                  },
                  DISPATCHED: {
                    label: "Awaiting Assignment",
                    color: "bg-yellow-100 text-yellow-700",
                    icon: Truck,
                  },
                  ACCEPTED: {
                    label: "Appraiser Assigned",
                    color: "bg-blue-100 text-blue-700",
                    icon: User,
                  },
                  IN_PROGRESS: {
                    label: "Inspection In Progress",
                    color: "bg-purple-100 text-purple-700",
                    icon: Camera,
                  },
                  SUBMITTED: {
                    label: "Photos Submitted",
                    color: "bg-orange-100 text-orange-700",
                    icon: FileText,
                  },
                  UNDER_REVIEW: {
                    label: "Under Review",
                    color: "bg-indigo-100 text-indigo-700",
                    icon: Clock,
                  },
                  COMPLETED: {
                    label: "Completed",
                    color: "bg-green-100 text-green-700",
                    icon: CheckCircle,
                  },
                  CANCELLED: {
                    label: "Cancelled",
                    color: "bg-red-100 text-red-700",
                    icon: AlertTriangle,
                  },
                  FAILED: {
                    label: "Failed",
                    color: "bg-red-100 text-red-700",
                    icon: AlertTriangle,
                  },
                };
                const status = jobStatusConfig[job.status] || {
                  label: job.status,
                  color: "bg-gray-100 text-gray-700",
                  icon: Clock,
                };
                const StatusIcon = status.icon;

                return (
                  <div key={job.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>

                    {job.slaDueAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500">Due by</p>
                          <p className="font-medium text-gray-900">
                            {new Date(job.slaDueAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Progress indicator */}
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        {[
                          "DISPATCHED",
                          "ACCEPTED",
                          "IN_PROGRESS",
                          "SUBMITTED",
                          "COMPLETED",
                        ].map((step, idx, arr) => {
                          const stepOrder = [
                            "PENDING_DISPATCH",
                            "DISPATCHED",
                            "ACCEPTED",
                            "IN_PROGRESS",
                            "SUBMITTED",
                            "UNDER_REVIEW",
                            "COMPLETED",
                          ];
                          const currentIdx = stepOrder.indexOf(job.status);
                          const stepIdx = stepOrder.indexOf(step);
                          const isComplete = stepIdx <= currentIdx;
                          const isCurrent = step === job.status;

                          return (
                            <div
                              key={step}
                              className="flex items-center flex-1"
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  isComplete
                                    ? "bg-green-500"
                                    : isCurrent
                                      ? "bg-blue-500"
                                      : "bg-gray-300"
                                }`}
                              />
                              {idx < arr.length - 1 && (
                                <div
                                  className={`flex-1 h-0.5 mx-1 ${isComplete ? "bg-green-500" : "bg-gray-300"}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Assigned</span>
                        <span>Complete</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Share Report */}
          {report && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-card-foreground mb-4">
                Share Report
              </h2>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    if (existingShareLink?.url) {
                      await navigator.clipboard.writeText(
                        existingShareLink.url,
                      );
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    } else {
                      // Create a new share link and copy it
                      const result = await shareMutation.mutateAsync({
                        reportId: report.id,
                        expiresInDays: 7,
                        allowDownload: true,
                      });
                      await navigator.clipboard.writeText(result.shareUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }
                  }}
                  disabled={shareMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground disabled:opacity-50"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : shareMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-card-foreground"
                >
                  <Mail className="w-4 h-4" />
                  Email Report
                </button>
              </div>
              {existingShareLink && (
                <p className="text-xs text-muted-foreground mt-3">
                  Active link expires{" "}
                  {new Date(existingShareLink.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Need Help */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Have questions about this appraisal or need a different report
              type?
            </p>
            <a
              href="mailto:support@projectlens.com?subject=Support Request - Appraisal"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Phone className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
