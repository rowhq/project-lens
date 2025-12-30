"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
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
} from "lucide-react";
import { trpc } from "@/shared/lib/trpc";
import { MapView } from "@/shared/components/common/MapView";
import { useToast } from "@/shared/components/ui/Toast";

type JobStatus = "PENDING_DISPATCH" | "DISPATCHED" | "ACCEPTED" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "CANCELLED";

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

const statusConfig: Record<JobStatus, { label: string; color: string; bgColor: string }> = {
  PENDING_DISPATCH: { label: "Pending", color: "text-[var(--muted-foreground)]", bgColor: "bg-[var(--muted)]" },
  DISPATCHED: { label: "Awaiting Appraiser", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
  ACCEPTED: { label: "Appraiser Assigned", color: "text-blue-400", bgColor: "bg-blue-500/20" },
  IN_PROGRESS: { label: "Inspection In Progress", color: "text-purple-400", bgColor: "bg-purple-500/20" },
  SUBMITTED: { label: "Pending Review", color: "text-orange-400", bgColor: "bg-orange-500/20" },
  COMPLETED: { label: "Completed", color: "text-green-400", bgColor: "bg-green-500/20" },
  CANCELLED: { label: "Cancelled", color: "text-[var(--muted-foreground)]", bgColor: "bg-[var(--muted)]" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const toast = useToast();
  const orderId = params.id as string;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const { data: orderData, isLoading, refetch } = trpc.job.getForClient.useQuery({ id: orderId });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--muted-foreground)]">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">Order not found</h2>
        <Link href="/orders" className="text-[var(--primary)] hover:underline mt-2 inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status as JobStatus] || statusConfig.PENDING_DISPATCH;
  const accessContact = order.accessContact as { name?: string; phone?: string } | null;

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
    } catch (error) {
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
        const result = await getDownloadUrl.mutateAsync({ evidenceId: evidence.id });
        const link = document.createElement("a");
        link.href = result.url;
        link.download = evidence.category || `photo-${evidence.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        successCount++;
        // Small delay to avoid overwhelming the browser
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

  // Prepare map marker if coordinates exist
  const mapMarkers = order.property?.latitude && order.property?.longitude
    ? [{
        id: order.id,
        latitude: order.property.latitude,
        longitude: order.property.longitude,
        label: order.property.addressLine1,
        popup: `<strong>${order.property.addressLine1}</strong><br/>${order.property.city}, ${order.property.state} ${order.property.zipCode}`,
      }]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Order Details</h1>
          <p className="text-[var(--muted-foreground)]">{order.property?.addressLine1}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Map Section */}
      {order.property?.latitude && order.property?.longitude && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
            <Map className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-sm font-medium text-[var(--foreground)]">Property Location</h2>
          </div>
          <MapView
            center={[order.property.longitude, order.property.latitude]}
            zoom={15}
            markers={mapMarkers}
            showLayerControls
            showBaseLayerSwitcher
            defaultBaseLayer="dark"
            style={{ height: 350 }}
          />
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Order Progress</h2>
        <div className="flex items-center justify-between">
          {["Order Created", "Appraiser Assigned", "Inspection", "Complete"].map((step, index) => {
            const isCompleted = getProgressStep(order.status) > index;
            const isCurrent = getProgressStep(order.status) === index;

            return (
              <div key={step} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm mt-2 ${isCurrent ? "font-medium text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                    {step}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 ${
                      isCompleted ? "bg-green-500" : "bg-[var(--muted)]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Details */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Property</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--primary)] mt-0.5" />
              <div>
                <p className="font-medium text-[var(--foreground)]">{order.property?.addressLine1}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {order.property?.city}, {order.property?.state} {order.property?.zipCode}
                </p>
              </div>
            </div>
            {order.property?.propertyType && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">
                  {order.property.propertyType.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Order Info</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Scope</span>
              <span className="font-medium text-[var(--foreground)]">{order.scope?.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Order Date</span>
              <span className="text-[var(--foreground)]">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            {order.slaDueAt && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Due Date</span>
                <span className="flex items-center gap-1 text-[var(--foreground)]">
                  <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                  {new Date(order.slaDueAt).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Price</span>
              <span className="font-semibold text-[var(--foreground)]">${Number(order.payoutAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Appraiser Info */}
        {order.assignedAppraiser && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Appraiser</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {order.assignedAppraiser.firstName} {order.assignedAppraiser.lastName}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">Licensed Appraiser</p>
              </div>
            </div>
            {order.acceptedAt && (
              <p className="text-sm text-[var(--muted-foreground)] mt-4">
                Accepted on {new Date(order.acceptedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Contact Info */}
        {(accessContact || order.specialInstructions) && (
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Contact & Notes</h2>
            <div className="space-y-3">
              {accessContact?.name && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--foreground)]">{accessContact.name}</span>
                </div>
              )}
              {accessContact?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--foreground)]">{accessContact.phone}</span>
                </div>
              )}
              {order.specialInstructions && (
                <div className="mt-3 p-3 bg-[var(--secondary)] rounded-lg">
                  <p className="text-sm text-[var(--foreground)]">{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Evidence Gallery */}
      {order.evidence && order.evidence.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Photos ({order.evidence.length})</h2>
            <button
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors disabled:opacity-50"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloadingAll ? "Downloading..." : "Download All"}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {order.evidence.slice(0, 8).map((item, index) => (
              <div
                key={item.id}
                className="aspect-square bg-[var(--muted)] rounded-lg overflow-hidden relative group"
              >
                <img
                  src={item.fileUrl}
                  alt={item.category || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenPhoto(index)}
                    className="p-2 bg-[var(--card)] rounded-lg hover:bg-[var(--secondary)] transition-colors"
                    title="View full size"
                  >
                    <ExternalLink className="w-4 h-4 text-[var(--foreground)]" />
                  </button>
                  <button
                    onClick={() => handleDownloadSingle(item.id, item.category || `photo-${index + 1}`)}
                    className="p-2 bg-[var(--card)] rounded-lg hover:bg-[var(--secondary)] transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-[var(--foreground)]" />
                  </button>
                </div>
                {item.category && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70">
                    <p className="text-xs text-white truncate">{item.category}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {order.evidence.length > 8 && (
            <button
              onClick={() => setShowGalleryModal(true)}
              className="mt-4 text-[var(--primary)] hover:underline"
            >
              View all {order.evidence.length} photos
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {order.status === "COMPLETED" && order.appraisalRequestId && (
          <Link
            href={`/appraisals/${order.appraisalRequestId}`}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Report
          </Link>
        )}
        {order.status === "DISPATCHED" && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Cancel Order</h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>
            <p className="text-[var(--muted-foreground)] mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelOrder.isPending}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrder.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
      {showGalleryModal && order.evidence && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            onClick={() => setShowGalleryModal(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-4xl w-full mx-4">
            <div className="relative">
              <img
                src={order.evidence[selectedPhotoIndex]?.fileUrl}
                alt={order.evidence[selectedPhotoIndex]?.category || `Photo ${selectedPhotoIndex + 1}`}
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
              {order.evidence[selectedPhotoIndex]?.category && (
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 rounded-lg">
                  <p className="text-sm text-white">{order.evidence[selectedPhotoIndex].category}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : order.evidence!.length - 1))}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Previous
              </button>
              <span className="text-white">
                {selectedPhotoIndex + 1} / {order.evidence.length}
              </span>
              <button
                onClick={() => setSelectedPhotoIndex((prev) => (prev < order.evidence!.length - 1 ? prev + 1 : 0))}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Next
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleDownloadSingle(
                  order.evidence![selectedPhotoIndex].id,
                  order.evidence![selectedPhotoIndex].category || `photo-${selectedPhotoIndex + 1}`
                )}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Photo
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
    case "DISPATCHED": return 0;
    case "ACCEPTED": return 1;
    case "IN_PROGRESS":
    case "SUBMITTED": return 2;
    case "COMPLETED": return 4;
    case "CANCELLED": return -1;
    default: return 0;
  }
}
