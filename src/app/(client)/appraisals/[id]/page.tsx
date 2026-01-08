"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import { PRICING } from "@/shared/config/constants";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ArrowLeft,
  Download,
  Share2,
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
  Camera,
  Truck,
  Trash2,
  Loader2,
  Award,
  Check,
} from "lucide-react";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { SLAProgressTracker, ShareModal, EmailModal } from "./_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppraisalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const paymentToastShownRef = useRef(false);
  const paymentConfirmedRef = useRef(false);

  const {
    data: appraisal,
    isLoading,
    refetch,
  } = trpc.appraisal.getById.useQuery({ id });

  const deleteMutation = trpc.appraisal.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Appraisal deleted",
        description: "The appraisal has been deleted successfully.",
      });
      router.push("/appraisals");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete appraisal",
        variant: "destructive",
      });
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete appraisal ${appraisal?.referenceCode}? This action cannot be undone.`,
      )
    ) {
      setIsDeleting(true);
      deleteMutation.mutate({ id });
    }
  };

  // Server-side PDF download mutation (uses Gotenberg)
  const downloadMutation = trpc.report.download.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast({
        title: "PDF Downloaded",
        description: "Your report has been downloaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isPdfGenerating = downloadMutation.isPending;

  const handleDownloadPdf = () => {
    if (!appraisal?.report?.id) return;
    downloadMutation.mutate({ reportId: appraisal.report.id });
  };

  // Consolidated polling effect for payment and processing states
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const isWaitingForWebhook =
      paymentStatus === "success" && !paymentConfirmedRef.current;
    const isProcessing =
      appraisal && ["QUEUED", "RUNNING"].includes(appraisal.status);

    if (isWaitingForWebhook && !paymentToastShownRef.current) {
      const processedStatuses = ["QUEUED", "RUNNING", "READY", "FAILED"];
      if (appraisal && processedStatuses.includes(appraisal.status)) {
        paymentToastShownRef.current = true;
        paymentConfirmedRef.current = true;
        toast({
          title: "Payment successful!",
          description: "Your appraisal request is now being processed.",
        });
      }
    }

    const shouldPoll = isWaitingForWebhook || isProcessing;
    if (!shouldPoll) return;

    const POLL_INTERVAL = 3000;
    const MAX_WEBHOOK_WAIT = 30000;
    const MAX_PROCESSING_WAIT = 5 * 60 * 1000;

    const pollStartTime = Date.now();
    const maxWaitTime = isWaitingForWebhook
      ? MAX_WEBHOOK_WAIT
      : MAX_PROCESSING_WAIT;

    const interval = setInterval(() => {
      const elapsed = Date.now() - pollStartTime;

      if (elapsed >= maxWaitTime) {
        clearInterval(interval);
        if (isWaitingForWebhook && !paymentConfirmedRef.current) {
          toast({
            title: "Processing taking longer than expected",
            description:
              "Your payment was received. Please refresh the page in a moment.",
          });
        }
        return;
      }

      refetch();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [searchParams, appraisal?.status, refetch, toast]);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 clip-notch-sm" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-24 clip-notch-sm" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 clip-notch" />
            <Skeleton className="h-10 w-36 clip-notch" />
          </div>
        </div>
        <div className="bg-[var(--card)] clip-notch border border-lime-400/30 p-6">
          <div className="grid grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24 bg-[var(--secondary)]" />
                <Skeleton className="h-8 w-32 bg-[var(--secondary)]" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
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
          <div className="space-y-6">
            <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
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
        <p className="text-[var(--muted-foreground)]">Appraisal not found</p>
        <Link
          href="/appraisals"
          className="text-lime-400 hover:text-lime-300 mt-2 inline-block"
        >
          Back to appraisals
        </Link>
      </div>
    );
  }

  const report = appraisal.report;
  const property = appraisal.property;

  // Calculate value change vs market using comparable sales average
  const calculateValueChange = () => {
    if (!report?.valueEstimate) return null;

    const estimate = Number(report.valueEstimate);

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
    DRAFT:
      "bg-gray-700/50 text-[var(--foreground)] border border-[var(--border)]",
    SUBMITTED: "bg-lime-400/10 text-lime-400 border border-lime-400/30",
    IN_PROGRESS: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    UNDER_REVIEW:
      "bg-purple-500/10 text-purple-400 border border-purple-500/30",
    COMPLETED: "bg-lime-400/10 text-lime-400 border border-lime-400/30",
    CANCELLED: "bg-red-500/10 text-red-400 border border-red-500/30",
  };

  const jobStatusConfig: Record<
    string,
    { label: string; color: string; icon: typeof Clock }
  > = {
    PENDING_DISPATCH: {
      label: "Finding Appraiser",
      color:
        "bg-gray-700/50 text-[var(--foreground)] border border-[var(--border)]",
      icon: Clock,
    },
    DISPATCHED: {
      label: "Awaiting Assignment",
      color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
      icon: Truck,
    },
    ACCEPTED: {
      label: "Appraiser Assigned",
      color: "bg-lime-400/10 text-lime-400 border border-lime-400/30",
      icon: User,
    },
    IN_PROGRESS: {
      label: "Inspection In Progress",
      color: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
      icon: Camera,
    },
    SUBMITTED: {
      label: "Photos Submitted",
      color: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
      icon: FileText,
    },
    UNDER_REVIEW: {
      label: "Under Review",
      color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
      icon: Clock,
    },
    COMPLETED: {
      label: "Completed",
      color: "bg-lime-400/10 text-lime-400 border border-lime-400/30",
      icon: CheckCircle,
    },
    CANCELLED: {
      label: "Cancelled",
      color: "bg-red-500/10 text-red-400 border border-red-500/30",
      icon: AlertTriangle,
    },
    FAILED: {
      label: "Failed",
      color: "bg-red-500/10 text-red-400 border border-red-500/30",
      icon: AlertTriangle,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/appraisals"
            className="p-2 hover:bg-[var(--secondary)] clip-notch-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {appraisal.referenceCode}
              </h1>
              <span
                className={`px-3 py-1 clip-notch-sm text-sm font-mono uppercase tracking-wider ${statusColors[appraisal.status]}`}
              >
                {appraisal.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-[var(--muted-foreground)]">
              {property?.addressFull}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report && appraisal.status === "READY" && (
            <>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] clip-notch hover:bg-[var(--secondary)] text-white font-mono text-sm uppercase tracking-wider"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating || !appraisal?.report?.id}
                className="flex items-center gap-2 px-4 py-2 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300 disabled:opacity-50"
              >
                {isPdfGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isPdfGenerating ? "Generating..." : "Download PDF"}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 clip-notch hover:bg-red-500/10 text-red-400 font-mono text-sm uppercase tracking-wider disabled:opacity-50"
            title="Delete appraisal"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
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
        <div className="relative bg-[var(--card)] clip-notch border border-lime-400/30 p-6">
          <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-lime-400" />
          <div className="absolute -top-px -right-px w-3 h-3 border-r border-t border-lime-400" />
          <div className="absolute -bottom-px -left-px w-3 h-3 border-l border-b border-lime-400" />
          <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-lime-400" />
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-[var(--muted-foreground)] text-sm font-mono uppercase tracking-wider">
                Estimated Value
              </p>
              <p className="text-3xl font-bold text-lime-400 font-mono">
                ${Number(report.valueEstimate).toLocaleString()}
              </p>
              {valueChange !== null && (
                <div className="flex items-center gap-1 mt-1">
                  {valueChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-lime-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={
                      valueChange >= 0 ? "text-lime-400" : "text-red-400"
                    }
                  >
                    {valueChange >= 0 ? "+" : ""}
                    {valueChange.toFixed(1)}% vs comps avg
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-[var(--muted-foreground)] text-sm font-mono uppercase tracking-wider">
                Value Range
              </p>
              <p className="text-xl font-semibold text-white font-mono">
                ${Number(report.valueRangeMin).toLocaleString()} - $
                {Number(report.valueRangeMax).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)] text-sm font-mono uppercase tracking-wider">
                Confidence Score
              </p>
              <p className="text-xl font-semibold text-white font-mono">
                {report.confidenceScore}%
              </p>
              <div className="w-full bg-gray-700 clip-notch-sm h-2 mt-2">
                <div
                  className="bg-lime-400 h-2 clip-notch-sm"
                  style={{ width: `${report.confidenceScore}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)] text-sm font-mono uppercase tracking-wider">
                Report Type
              </p>
              <p className="text-xl font-semibold text-white">
                {report.type.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Property Details */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-lime-400" />
              Property Details
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                  Property Type
                </p>
                <p className="font-medium text-white">
                  {property?.propertyType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                  Square Feet
                </p>
                <p className="font-medium text-white">
                  {property?.sqft?.toLocaleString() || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                  Year Built
                </p>
                <p className="font-medium text-white">
                  {property?.yearBuilt || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                  Bedrooms
                </p>
                <p className="font-medium text-white">
                  {property?.bedrooms || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                  Bathrooms
                </p>
                <p className="font-medium text-white">
                  {property?.bathrooms || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                  Lot Size
                </p>
                <p className="font-medium text-white">
                  {property?.lotSizeSqft
                    ? `${(property.lotSizeSqft / 43560).toFixed(2)} acres`
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {report?.aiAnalysis && (
            <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                AI Analysis
              </h2>
              <p className="text-[var(--foreground)] mb-4">
                {(report.aiAnalysis as { summary?: string })?.summary}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-lime-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {(
                      (report.aiAnalysis as { strengths?: string[] })
                        ?.strengths || []
                    ).map((strength: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-[var(--muted-foreground)]"
                      >
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Considerations
                  </h3>
                  <ul className="space-y-1">
                    {(
                      (report.aiAnalysis as { concerns?: string[] })
                        ?.concerns || []
                    ).map((concern: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-[var(--muted-foreground)]"
                      >
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
            <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Comparable Sales
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--secondary)]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-mono font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-mono font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Sale Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-mono font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Sq Ft
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-mono font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-mono font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                        Match
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
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
                          <td className="px-4 py-3 text-sm text-white">
                            {comp.address}
                          </td>
                          <td className="px-4 py-3 text-sm text-white font-mono">
                            ${comp.salePrice?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] font-mono">
                            {comp.sqft?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] font-mono">
                            {comp.distance?.toFixed(1)} mi
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-lime-400/10 text-lime-400 text-xs clip-notch-sm font-mono">
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
              <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
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
                      className={`p-4 clip-notch-sm border-l-4 ${
                        risk.severity === "HIGH"
                          ? "bg-red-500/10 border-red-500"
                          : risk.severity === "MEDIUM"
                            ? "bg-yellow-500/10 border-yellow-500"
                            : "bg-lime-400/10 border-lime-400"
                      }`}
                    >
                      <p className="font-medium text-white">
                        {risk.type?.replace(/_/g, " ") ?? "Unknown"}
                      </p>
                      <p className="text-sm text-[var(--foreground)] mt-1">
                        {risk.description ?? ""}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1 italic">
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
          <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Request Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                    Requested
                  </p>
                  <p className="font-medium text-white">
                    {new Date(appraisal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                    Purpose
                  </p>
                  <p className="font-medium text-white">{appraisal.purpose}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-lime-400" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] font-mono uppercase tracking-wider">
                    Price Paid
                  </p>
                  <p className="font-medium text-white font-mono">
                    ${Number(appraisal.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* On-Site Inspection Status */}
          {appraisal.jobs && appraisal.jobs.length > 0 && (
            <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-lime-400" />
                On-Site Inspection
              </h2>
              {appraisal.jobs.map((job) => {
                const status = jobStatusConfig[job.status] || {
                  label: job.status,
                  color:
                    "bg-gray-700/50 text-[var(--foreground)] border border-[var(--border)]",
                  icon: Clock,
                };
                const StatusIcon = status.icon;

                return (
                  <div key={job.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 clip-notch-sm text-sm font-mono uppercase tracking-wider ${status.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>

                    {job.slaDueAt && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-lime-400" />
                        <div>
                          <p className="text-[var(--muted-foreground)] font-mono uppercase tracking-wider text-xs">
                            Due by
                          </p>
                          <p className="font-medium text-white">
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
                      <div className="flex items-center text-xs text-[var(--muted-foreground)]">
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
                                className={`w-2.5 h-2.5 clip-notch-sm ${
                                  isComplete
                                    ? "bg-lime-400"
                                    : isCurrent
                                      ? "bg-lime-400/50"
                                      : "bg-gray-700"
                                }`}
                              />
                              {idx < arr.length - 1 && (
                                <div
                                  className={`flex-1 h-0.5 mx-1 ${isComplete ? "bg-lime-400" : "bg-gray-700"}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-[var(--muted-foreground)] font-mono">
                        <span>Assigned</span>
                        <span>Complete</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upgrade to Certified */}
          {appraisal.requestedType !== "CERTIFIED_APPRAISAL" &&
            appraisal.status === "READY" && (
              <div className="bg-gradient-to-br from-lime-400/10 to-lime-400/5 clip-notch border border-lime-400/30 p-6">
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-lime-400" />
                  Need a Certified Appraisal?
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Get a USPAP-compliant appraisal signed by a licensed
                  appraiser. Bank-ready for refinancing, lending, or legal
                  purposes.
                </p>
                <Link
                  href={`/appraisals/new?address=${encodeURIComponent(property?.addressLine1 || "")}&city=${encodeURIComponent(property?.city || "")}&state=${encodeURIComponent(property?.state || "TX")}&zipCode=${encodeURIComponent(property?.zipCode || "")}&type=CERTIFIED`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300"
                >
                  <FileText className="w-4 h-4" />
                  Request Certified Appraisal
                </Link>
                <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
                  Starting at ${PRICING.CERTIFIED} • 72 hour delivery
                </p>
              </div>
            )}

          {/* Share Report */}
          {report && (
            <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[var(--border)] clip-notch hover:bg-[var(--secondary)] text-white font-mono text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4 text-lime-400" />
                      Copied!
                    </>
                  ) : shareMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent clip-notch-sm animate-spin" />
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[var(--border)] clip-notch hover:bg-[var(--secondary)] text-white font-mono text-sm uppercase tracking-wider"
                >
                  <Mail className="w-4 h-4" />
                  Email Report
                </button>
              </div>
              {existingShareLink && (
                <p className="text-xs text-[var(--muted-foreground)] mt-3">
                  Active link expires{" "}
                  {new Date(existingShareLink.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Need Help */}
          <div className="bg-[var(--secondary)]/50 clip-notch border border-[var(--border)] p-6">
            <h2 className="font-semibold text-white mb-2">Need Help?</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Have questions about this appraisal or need a different report
              type?
            </p>
            <a
              href="mailto:support@truplat.com?subject=Support Request - Appraisal"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-400 text-black font-mono text-sm uppercase tracking-wider clip-notch hover:bg-lime-300"
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
