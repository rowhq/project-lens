"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle,
  Download,
  ExternalLink,
  Map,
  X,
  Loader2,
  ChevronRight,
  Share2,
  Printer,
  Copy,
  MoreVertical,
  AlertTriangle,
  ChevronLeft,
  Home,
  Calendar,
  DollarSign,
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import dynamic from "next/dynamic";

// Lazy load MapView to avoid SSR issues and improve initial load
const MapView = dynamic(
  () => import("@/shared/components/common/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-[var(--secondary)] animate-pulse clip-notch" />
    ),
  },
);
import { useToast } from "@/shared/components/ui/Toast";
import { Skeleton } from "@/shared/components/ui/Skeleton";

type JobStatus =
  | "PENDING_DISPATCH"
  | "DISPATCHED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "CANCELLED";

// Type for order with included relations
type OrderWithRelations = {
  id: string;
  status: string;
  scope: string | null;
  createdAt: Date;
  slaDueAt: Date | null;
  payoutAmount: number | string;
  specialInstructions: string | null;
  accessContact: unknown;
  acceptedAt: Date | null;
  appraisalRequestId: string | null;
  property: {
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string | null;
    latitude?: number;
    longitude?: number;
  } | null;
  assignedAppraiser: {
    firstName: string;
    lastName: string;
  } | null;
  evidence: Array<{
    id: string;
    fileUrl: string;
    category: string | null;
    notes: string | null;
  }>;
};

const statusConfig: Record<
  JobStatus,
  { label: string; color: string; bgColor: string }
> = {
  PENDING_DISPATCH: {
    label: "Pending",
    color: "text-[var(--muted-foreground)]",
    bgColor: "bg-[var(--muted)]",
  },
  DISPATCHED: {
    label: "Awaiting Appraiser",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
  },
  ACCEPTED: {
    label: "Appraiser Assigned",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  IN_PROGRESS: {
    label: "Inspection In Progress",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  SUBMITTED: {
    label: "Pending Review",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-[var(--muted-foreground)]",
    bgColor: "bg-[var(--muted)]",
  },
};

// Helper functions for SLA
function getTimeRemaining(dueDate: Date): {
  days: number;
  hours: number;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return {
    days: Math.abs(days),
    hours: Math.abs(hours),
    isOverdue: diff < 0,
    isUrgent: diff > 0 && diff < 48 * 60 * 60 * 1000, // Less than 48 hours
  };
}

function formatTimeRemaining(dueDate: Date): string {
  const { days, hours, isOverdue } = getTimeRemaining(dueDate);
  if (isOverdue) {
    return days > 0 ? `${days}d ${hours}h overdue` : `${hours}h overdue`;
  }
  return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
}

export default function OrderDetailPage() {
  const params = useParams();
  const toast = useToast();
  const orderId = params.id as string;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const {
    data: orderData,
    isLoading,
    refetch,
  } = trpc.job.getForClient.useQuery({ id: orderId });

  // Get download URL mutation for evidence
  const getDownloadUrl = trpc.evidence.getDownloadUrl.useMutation();

  // Cancel order mutation
  const cancelOrder = trpc.job.cancelForClient.useMutation({
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      setCancelReason("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });

  // Cast to typed order with relations
  const order = orderData as unknown as OrderWithRelations | undefined;

  // Keyboard navigation for gallery
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!showGalleryModal || !order?.evidence) return;

      if (e.key === "ArrowLeft") {
        setSelectedPhotoIndex((prev) =>
          prev > 0 ? prev - 1 : order.evidence.length - 1,
        );
      } else if (e.key === "ArrowRight") {
        setSelectedPhotoIndex((prev) =>
          prev < order.evidence.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "Escape") {
        setShowGalleryModal(false);
      }
    },
    [showGalleryModal, order],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowActionsMenu(false);
    if (showActionsMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showActionsMenu]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-36 rounded-full" />
            <Skeleton className="h-9 w-9 clip-notch-sm" />
          </div>
        </div>
        {/* Hero card skeleton */}
        <div className="bg-[var(--card)] clip-notch border border-[var(--border)] overflow-hidden">
          <div className="grid md:grid-cols-2">
            <Skeleton className="h-[300px] w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Timeline skeleton */}
        <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-3 w-16 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Order not found
        </h2>
        <Link
          href="/orders"
          className="text-[var(--primary)] hover:underline mt-2 inline-block"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const status =
    statusConfig[order.status as JobStatus] || statusConfig.PENDING_DISPATCH;
  const accessContact = order.accessContact as {
    name?: string;
    phone?: string;
  } | null;
  const slaInfo = order.slaDueAt ? getTimeRemaining(order.slaDueAt) : null;

  // Handler to download a single evidence file
  const handleDownloadSingle = async (evidenceId: string, fileName: string) => {
    try {
      const result = await getDownloadUrl.mutateAsync({ evidenceId });
      const link = document.createElement("a");
      link.href = result.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download file");
    }
  };

  // Handler to download all evidence files
  const handleDownloadAll = async () => {
    if (!order.evidence || order.evidence.length === 0) {
      toast.info("No photos available to download");
      return;
    }

    setIsDownloadingAll(true);
    toast.info(`Starting download of ${order.evidence.length} photos...`);

    let successCount = 0;
    let errorCount = 0;

    for (const evidence of order.evidence) {
      try {
        const result = await getDownloadUrl.mutateAsync({
          evidenceId: evidence.id,
        });
        const link = document.createElement("a");
        link.href = result.url;
        link.download = evidence.category || `photo-${evidence.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        successCount++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch {
        errorCount++;
      }
    }

    setIsDownloadingAll(false);
    if (errorCount === 0) {
      toast.success(`Successfully downloaded ${successCount} photos`);
    } else {
      toast.warning(`Downloaded ${successCount} photos, ${errorCount} failed`);
    }
  };

  // Handler to open photo in gallery modal
  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowGalleryModal(true);
  };

  // Handler to cancel order
  const handleCancelOrder = () => {
    cancelOrder.mutate({
      jobId: orderId,
      reason: cancelReason || undefined,
    });
  };

  // Share order
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order - ${order.property?.addressLine1}`,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
    setShowActionsMenu(false);
  };

  // Print order
  const handlePrint = () => {
    window.print();
    setShowActionsMenu(false);
  };

  // Prepare map marker if coordinates exist
  const mapMarkers =
    order.property?.latitude && order.property?.longitude
      ? [
          {
            id: order.id,
            latitude: order.property.latitude,
            longitude: order.property.longitude,
            label: order.property.addressLine1,
            popup: `<strong>${order.property.addressLine1}</strong><br/>${order.property.city}, ${order.property.state} ${order.property.zipCode}`,
          },
        ]
      : [];

  const canCancel = ["PENDING_DISPATCH", "DISPATCHED", "ACCEPTED"].includes(
    order.status,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] print:hidden">
        <Link
          href="/orders"
          className="hover:text-[var(--foreground)] transition-colors"
        >
          Orders
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--foreground)] truncate max-w-[200px]">
          {order.property?.addressLine1}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/orders"
            className="p-2 hover:bg-[var(--secondary)] clip-notch-sm transition-colors print:hidden"
            aria-label="Back to orders"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {order.property?.addressLine1}
            </h1>
            <p className="text-[var(--muted-foreground)]">
              {order.property?.city}, {order.property?.state}{" "}
              {order.property?.zipCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}
          >
            {status.label}
          </span>

          {/* SLA Indicator */}
          {slaInfo && (slaInfo.isUrgent || slaInfo.isOverdue) && (
            <span
              className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${
                slaInfo.isOverdue
                  ? "bg-red-500/20 text-red-400"
                  : "bg-orange-500/20 text-orange-400"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">
                {formatTimeRemaining(order.slaDueAt!)}
              </span>
            </span>
          )}

          {/* Actions Menu */}
          <div className="relative print:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionsMenu(!showActionsMenu);
              }}
              className="p-2 hover:bg-[var(--secondary)] clip-notch-sm transition-colors"
              aria-label="More actions"
            >
              <MoreVertical className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card)] border border-[var(--border)] clip-notch-sm shadow-lg z-20 overflow-hidden">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] flex items-center gap-3 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Order
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] flex items-center gap-3 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <Link
                  href="/orders/new"
                  className="w-full px-4 py-3 text-left text-sm text-[var(--foreground)] hover:bg-[var(--secondary)] flex items-center gap-3 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  New Similar Order
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Card: Map + Property Info */}
      <div className="bg-[var(--card)] clip-notch border border-[var(--border)] overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Map */}
          {order.property?.latitude && order.property?.longitude ? (
            <div className="print:hidden" style={{ height: 300 }}>
              <MapView
                center={[order.property.longitude, order.property.latitude]}
                zoom={15}
                markers={mapMarkers}
                showBaseLayerSwitcher
                defaultBaseLayer="satellite"
                style={{ height: 300 }}
              />
            </div>
          ) : (
            <div
              className="bg-[var(--muted)] flex items-center justify-center print:hidden"
              style={{ height: 300 }}
            >
              <div className="text-center text-[var(--muted-foreground)]">
                <Map className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Location not available</p>
              </div>
            </div>
          )}

          {/* Property Info */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-[var(--primary)]/10 clip-notch-sm">
                <Home className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--foreground)]">
                  Property Details
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {order.property?.propertyType?.replace(/_/g, " ") ||
                    "Property"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                  Scope
                </p>
                <p className="font-medium text-[var(--foreground)]">
                  {order.scope?.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                  Order Total
                </p>
                <p className="font-semibold text-[var(--foreground)] flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {Number(order.payoutAmount).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                  Order Date
                </p>
                <p className="text-[var(--foreground)] flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              {order.slaDueAt && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">
                    Due Date
                  </p>
                  <p
                    className={`flex items-center gap-1 ${
                      slaInfo?.isOverdue
                        ? "text-red-400"
                        : slaInfo?.isUrgent
                          ? "text-orange-400"
                          : "text-[var(--foreground)]"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {new Date(order.slaDueAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Order Progress
        </h2>
        <div className="flex items-center">
          {["Created", "Assigned", "Inspection", "Complete"].map(
            (step, index) => {
              const isCompleted = getProgressStep(order.status) > index;
              const isCurrent = getProgressStep(order.status) === index;

              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-[var(--primary)] text-black font-medium"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs sm:text-sm mt-2 text-center ${
                        isCurrent
                          ? "font-medium text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      <span className="hidden sm:inline">{step}</span>
                      <span className="sm:hidden">{index + 1}</span>
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-colors ${
                        isCompleted ? "bg-green-500" : "bg-[var(--muted)]"
                      }`}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appraiser Info */}
        {order.assignedAppraiser && (
          <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
              Appraiser
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {order.assignedAppraiser.firstName}{" "}
                  {order.assignedAppraiser.lastName}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Licensed Appraiser
                </p>
                {order.acceptedAt && (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Accepted {new Date(order.acceptedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(accessContact?.name ||
          accessContact?.phone ||
          order.specialInstructions) && (
          <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
              Property Contact
            </h3>
            <div className="space-y-3">
              {accessContact?.name && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--foreground)]">
                    {accessContact.name}
                  </span>
                </div>
              )}
              {accessContact?.phone && (
                <a
                  href={`tel:${accessContact.phone}`}
                  className="flex items-center gap-3 text-[var(--primary)] hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {accessContact.phone}
                </a>
              )}
              {order.specialInstructions && (
                <div className="p-3 bg-[var(--secondary)] clip-notch-sm mt-2">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    Access Notes
                  </p>
                  <p className="text-sm text-[var(--foreground)]">
                    {order.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Evidence Gallery */}
      {Array.isArray(order.evidence) && order.evidence.length > 0 && (
        <div className="bg-[var(--card)] clip-notch border border-[var(--border)] p-6 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Photos ({order.evidence.length})
            </h2>
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors disabled:opacity-50 print:hidden"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloadingAll ? "Downloading..." : "Download All"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {order.evidence.slice(0, 8).map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleOpenPhoto(index)}
                className="aspect-square bg-[var(--muted)] clip-notch-sm overflow-hidden relative group focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              >
                <img
                  src={item.fileUrl}
                  alt={item.category || `Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                {item.category && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70">
                    <p className="text-xs text-white truncate">
                      {item.category}
                    </p>
                  </div>
                )}
              </button>
            ))}
            {order.evidence.length > 8 && (
              <button
                onClick={() => handleOpenPhoto(8)}
                className="aspect-square bg-[var(--muted)] clip-notch-sm overflow-hidden relative flex items-center justify-center"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    +{order.evidence.length - 8}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    more photos
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        {order.status === "COMPLETED" && order.appraisalRequestId && (
          <Link
            href={`/appraisals/${order.appraisalRequestId}`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium clip-notch-sm hover:bg-[var(--primary)]/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Report
          </Link>
        )}
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 text-red-400 border border-red-500/30 clip-notch-sm hover:bg-red-500/10 transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] clip-notch w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Cancel Order
              </h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-[var(--secondary)] clip-notch-sm transition-colors"
                aria-label="Close cancel modal"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>
            <p className="text-[var(--muted-foreground)] mb-4">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="w-full px-4 py-2 border border-[var(--border)] clip-notch-sm bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelOrder.isPending}
                className="flex-1 px-4 py-2 border border-[var(--border)] clip-notch-sm hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrder.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white clip-notch-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showGalleryModal &&
        Array.isArray(order.evidence) &&
        order.evidence.length > 0 && (
          <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
            role="dialog"
            aria-label="Photo gallery"
          >
            <button
              onClick={() => setShowGalleryModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 clip-notch-sm transition-colors z-10"
              aria-label="Close gallery"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation arrows */}
            <button
              onClick={() =>
                setSelectedPhotoIndex((prev) =>
                  prev > 0 ? prev - 1 : order.evidence!.length - 1,
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() =>
                setSelectedPhotoIndex((prev) =>
                  prev < order.evidence!.length - 1 ? prev + 1 : 0,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div className="max-w-5xl w-full mx-4">
              <div className="relative">
                <img
                  src={order.evidence[selectedPhotoIndex]?.fileUrl}
                  alt={
                    order.evidence[selectedPhotoIndex]?.category ||
                    `Photo ${selectedPhotoIndex + 1}`
                  }
                  className="w-full max-h-[75vh] object-contain clip-notch-sm"
                />
                {order.evidence[selectedPhotoIndex]?.category && (
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 clip-notch-sm">
                    <p className="text-sm text-white">
                      {order.evidence[selectedPhotoIndex].category}
                    </p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex items-center justify-center gap-2 mt-4 overflow-x-auto py-2">
                {order.evidence.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`w-16 h-16 clip-notch-sm overflow-hidden flex-shrink-0 transition-all ${
                      index === selectedPhotoIndex
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                        : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={item.fileUrl}
                      alt={item.category || `Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Counter and download */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-white/60 text-sm flex items-center gap-1">
                  Use <ChevronLeft className="w-4 h-4 inline" />
                  <ChevronRight className="w-4 h-4 inline" /> keys to navigate,
                  ESC to close
                </span>
                <span className="text-white" aria-live="polite">
                  {selectedPhotoIndex + 1} / {order.evidence.length}
                </span>
                <button
                  onClick={() =>
                    handleDownloadSingle(
                      order.evidence![selectedPhotoIndex].id,
                      order.evidence![selectedPhotoIndex].category ||
                        `photo-${selectedPhotoIndex + 1}`,
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black font-medium clip-notch-sm hover:opacity-90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function getProgressStep(status: string): number {
  switch (status) {
    case "PENDING_DISPATCH":
    case "DISPATCHED":
      return 0;
    case "ACCEPTED":
      return 1;
    case "IN_PROGRESS":
    case "SUBMITTED":
      return 2;
    case "COMPLETED":
      return 4;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}
