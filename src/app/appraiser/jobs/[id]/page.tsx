"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Home,
  Calendar,
  Navigation,
  Phone,
  Camera,
  FileText,
  Check,
  ChevronRight,
  Play,
  Send,
  Loader2,
} from "lucide-react";
import { MapView } from "@/shared/components/common/MapView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");

  const { data: job, isLoading, refetch } = trpc.job.getById.useQuery({ id });

  const acceptJob = trpc.job.accept.useMutation({
    onSuccess: () => refetch(),
  });

  const startJob = trpc.job.start.useMutation({
    onSuccess: () => refetch(),
  });

  const submitJob = trpc.job.submit.useMutation({
    onSuccess: () => router.push("/jobs?status=completed"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">Job not found</p>
        <Link href="/jobs" className="text-[var(--primary)] hover:underline mt-2 inline-block">
          Back to jobs
        </Link>
      </div>
    );
  }

  const property = job.property;
  const isMyJob = job.assignedAppraiserId !== null;
  const canAccept = job.status === "DISPATCHED" && !isMyJob;
  const canStart = job.status === "ACCEPTED" && isMyJob;
  const canSubmit = job.status === "IN_PROGRESS" && isMyJob;

  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDING_DISPATCH: { color: "bg-[var(--muted)] text-[var(--muted-foreground)]", label: "Pending" },
    DISPATCHED: { color: "bg-blue-500/20 text-blue-400", label: "Available" },
    ACCEPTED: { color: "bg-yellow-500/20 text-yellow-400", label: "Accepted" },
    IN_PROGRESS: { color: "bg-purple-500/20 text-purple-400", label: "In Progress" },
    EVIDENCE_SUBMITTED: { color: "bg-orange-500/20 text-orange-400", label: "Evidence Submitted" },
    COMPLETED: { color: "bg-green-500/20 text-green-400", label: "Completed" },
    CANCELLED: { color: "bg-red-500/20 text-red-400", label: "Cancelled" },
  };

  // Prepare map marker
  const mapMarkers = property?.latitude && property?.longitude
    ? [{
        id: job.id,
        latitude: property.latitude,
        longitude: property.longitude,
        label: property.addressLine1,
        popup: `<strong>${property.addressLine1}</strong><br/>${property.city}, ${property.state} ${property.zipCode}`,
      }]
    : [];

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--foreground)]">Job Details</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[job.status]?.color}`}>
              {statusConfig[job.status]?.label}
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">Ref: {job.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Property Card with Map */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        {/* Interactive Map */}
        {property?.latitude && property?.longitude ? (
          <MapView
            center={[property.longitude, property.latitude]}
            zoom={15}
            markers={mapMarkers}
            showLayerControls
            showBaseLayerSwitcher
            defaultBaseLayer="dark"
            style={{ height: 200 }}
          />
        ) : (
          <div className="h-40 bg-[var(--muted)] flex items-center justify-center">
            <MapPin className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
        )}

        <div className="p-4">
          <h2 className="font-semibold text-[var(--foreground)] text-lg">{property?.addressLine1}</h2>
          <p className="text-[var(--muted-foreground)]">
            {property?.city}, {property?.state} {property?.zipCode}
          </p>

          <div className="flex gap-2 mt-3">
            <a
              href={property?.latitude && property?.longitude
                ? `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property?.addressLine1} ${property?.city} ${property?.state} ${property?.zipCode}`)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Navigate
            </a>
            <button
              onClick={() => {
                // Check if we have access contact info from the job
                const accessContact = job.accessContact as { phone?: string } | null;
                const phone = accessContact?.phone || null;
                if (phone) {
                  window.location.href = `tel:${phone}`;
                } else {
                  toast({
                    title: "Contact unavailable",
                    description: "No contact phone number is available for this property.",
                  });
                }
              }}
              className="flex items-center justify-center px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Job Info */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">Job Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Payout</p>
              <p className="font-bold text-green-400 text-lg">${Number(job.payoutAmount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Type</p>
              <p className="font-medium text-[var(--foreground)]">{job.jobType?.replace("_", " ")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Due Date</p>
              <p className="font-medium text-[var(--foreground)]">
                {job.slaDueAt ? new Date(job.slaDueAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Time Remaining</p>
              <p className="font-medium text-[var(--foreground)]">
                {job.slaDueAt
                  ? `${Math.max(0, Math.round((new Date(job.slaDueAt).getTime() - Date.now()) / (1000 * 60 * 60)))}h`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-[var(--muted-foreground)]" />
          Property Details
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-[var(--muted-foreground)]">Type</p>
            <p className="font-medium text-[var(--foreground)]">{property?.propertyType?.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Sq Ft</p>
            <p className="font-medium text-[var(--foreground)]">{property?.sqft?.toLocaleString() || "-"}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Year Built</p>
            <p className="font-medium text-[var(--foreground)]">{property?.yearBuilt || "-"}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Bedrooms</p>
            <p className="font-medium text-[var(--foreground)]">{property?.bedrooms || "-"}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Bathrooms</p>
            <p className="font-medium text-[var(--foreground)]">{property?.bathrooms || "-"}</p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Lot Size</p>
            <p className="font-medium text-[var(--foreground)]">
              {property?.lotSizeSqft ? `${(property.lotSizeSqft / 43560).toFixed(2)} ac` : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {job.specialInstructions && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-2">Special Instructions</h3>
          <p className="text-[var(--muted-foreground)] text-sm">{job.specialInstructions}</p>
        </div>
      )}

      {/* Evidence Section (for active jobs) */}
      {(job.status === "IN_PROGRESS" || job.status === "SUBMITTED") && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--muted-foreground)]" />
            Evidence Photos
          </h3>

          <Link
            href={`/jobs/${id}/evidence`}
            className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">Capture Evidence</p>
                <p className="text-sm text-[var(--muted-foreground)]">0 of 5 required photos</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </Link>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Appraiser Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your inspection notes here..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-[var(--card)] border-t border-[var(--border)] md:relative md:border-0 md:p-0 md:bg-transparent">
        {canAccept && (
          <button
            onClick={() => acceptJob.mutate({ jobId: id })}
            disabled={acceptJob.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-[var(--muted)] transition-colors"
          >
            {acceptJob.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            Accept Job - ${Number(job.payoutAmount)}
          </button>
        )}

        {canStart && (
          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  startJob.mutate({
                    jobId: id,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  });
                },
                () => {
                  // Fallback if geolocation fails
                  startJob.mutate({ jobId: id, latitude: 0, longitude: 0 });
                }
              );
            }}
            disabled={startJob.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-lg font-semibold hover:bg-[var(--primary)]/90 disabled:bg-[var(--muted)] transition-colors"
          >
            {startJob.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            Start Inspection
          </button>
        )}

        {canSubmit && (
          <button
            onClick={() => submitJob.mutate({ jobId: id, notes })}
            disabled={submitJob.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-[var(--muted)] transition-colors"
          >
            {submitJob.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Submit for Review
          </button>
        )}

        {job.status === "COMPLETED" && (
          <div className="flex items-center justify-center gap-2 py-3 bg-green-500/20 text-green-400 rounded-lg font-medium">
            <Check className="w-5 h-5" />
            Job Completed
          </div>
        )}
      </div>
    </div>
  );
}
