"use client";

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  useLiveCountdown,
  getUrgencyConfig,
} from "@/shared/hooks/useLiveCountdown";
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
  Share2,
  AlertTriangle,
  XCircle,
  Mic,
  MicOff,
  CheckCircle,
  Star,
} from "lucide-react";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { MapView } from "@/shared/components/common/MapView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isListening, setIsListening] = useState(false);

  const { data: job, isLoading, refetch } = trpc.job.getById.useQuery({ id });

  // Live countdown
  const countdown = useLiveCountdown(job?.slaDueAt || null);
  const urgency = getUrgencyConfig(
    countdown.hoursRemaining,
    countdown.isOverdue,
  );

  const acceptJob = trpc.job.accept.useMutation({
    onSuccess: () => {
      refetch();
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      toast({
        title: "Job accepted!",
        description: "You can now start the inspection.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to accept",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startJob = trpc.job.start.useMutation({
    onSuccess: () => {
      refetch();
      if (navigator.vibrate) navigator.vibrate(100);
      toast({
        title: "Inspection started!",
        description: "Take photos and complete the evidence checklist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to start",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitJob = trpc.job.submit.useMutation({
    onSuccess: () => {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
      toast({
        title: "Job submitted!",
        description: "Your work has been sent for review.",
      });
      router.push("/appraiser/jobs?tab=completed");
    },
    onError: (error) => {
      toast({
        title: "Failed to submit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelJob = trpc.job.cancelByAppraiser.useMutation({
    onSuccess: () => {
      toast({
        title: "Job cancelled",
        description: "The job has been returned to available jobs.",
      });
      router.push("/appraiser/jobs");
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Voice to text for notes
  const toggleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setNotes((prev) => prev + " " + transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice input error",
        description: "Could not capture voice. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Share job details
  const handleShare = async () => {
    if (navigator.share && job) {
      try {
        await navigator.share({
          title: `Job at ${job.property?.addressLine1}`,
          text: `Appraisal job: ${job.property?.addressLine1}, ${job.property?.city} - $${Number(job.payoutAmount)}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24 md:pb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <Skeleton className="h-[200px] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="flex-1 h-10 rounded-lg" />
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[var(--muted-foreground)]" />
        </div>
        <p className="text-[var(--foreground)] font-medium mb-2">
          Job not found
        </p>
        <p className="text-[var(--muted-foreground)] text-sm mb-4">
          This job may have been cancelled or doesn&apos;t exist.
        </p>
        <Link
          href="/appraiser/jobs"
          className="text-[var(--primary)] hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </Link>
      </div>
    );
  }

  const property = job.property;
  const isMyJob = job.assignedAppraiserId !== null;
  const canAccept = job.status === "DISPATCHED";
  const canStart = job.status === "ACCEPTED" && isMyJob;
  const canSubmit = job.status === "IN_PROGRESS" && isMyJob;
  const canCancel = job.status === "ACCEPTED" && isMyJob;

  const statusConfig: Record<
    string,
    { color: string; label: string; icon: typeof Clock }
  > = {
    PENDING_DISPATCH: {
      color: "bg-[var(--muted)] text-[var(--muted-foreground)]",
      label: "Pending",
      icon: Clock,
    },
    DISPATCHED: {
      color: "bg-blue-500/20 text-blue-400",
      label: "Available",
      icon: Star,
    },
    ACCEPTED: {
      color: "bg-yellow-500/20 text-yellow-400",
      label: "Accepted",
      icon: Check,
    },
    IN_PROGRESS: {
      color: "bg-purple-500/20 text-purple-400",
      label: "In Progress",
      icon: Play,
    },
    SUBMITTED: {
      color: "bg-orange-500/20 text-orange-400",
      label: "Submitted",
      icon: Send,
    },
    UNDER_REVIEW: {
      color: "bg-orange-500/20 text-orange-400",
      label: "Under Review",
      icon: FileText,
    },
    COMPLETED: {
      color: "bg-green-500/20 text-green-400",
      label: "Completed",
      icon: CheckCircle,
    },
    CANCELLED: {
      color: "bg-red-500/20 text-red-400",
      label: "Cancelled",
      icon: XCircle,
    },
  };

  const mapMarkers =
    property?.latitude && property?.longitude
      ? [
          {
            id: job.id,
            latitude: property.latitude,
            longitude: property.longitude,
            label: property.addressLine1,
            popup: `<strong>${property.addressLine1}</strong><br/>${property.city}, ${property.state} ${property.zipCode}`,
          },
        ]
      : [];

  return (
    <div className="space-y-4 pb-28 md:pb-6">
      {/* Urgency Banner */}
      {(urgency.level === "critical" || urgency.level === "overdue") && (
        <div
          className={`${urgency.bgClass} border-2 rounded-lg p-3 flex items-center gap-3 animate-pulse`}
        >
          <span className="text-2xl">{urgency.icon}</span>
          <div className="flex-1">
            <p className={`font-bold ${urgency.textClass}`}>{urgency.label}</p>
            <p className={`text-sm ${urgency.textClass}/80`}>
              {countdown.isOverdue
                ? "This job is past its due date!"
                : `Only ${countdown.timeRemaining} remaining`}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 hover:bg-[var(--secondary)] rounded-lg transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--foreground)]">
                Job Details
              </h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig[job.status]?.color}`}
              >
                {statusConfig[job.status]?.label}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Ref: {job.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="p-2.5 hover:bg-[var(--secondary)] rounded-lg transition-colors touch-manipulation"
        >
          <Share2 className="w-5 h-5 text-[var(--muted-foreground)]" />
        </button>
      </div>

      {/* Property Card with Map */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        {property?.latitude && property?.longitude ? (
          <div className="h-[200px]">
            <MapView
              center={[property.longitude, property.latitude]}
              zoom={15}
              markers={mapMarkers}
              showLayerControls
              showBaseLayerSwitcher
              defaultBaseLayer="streets"
              style={{ height: "100%" }}
              className="h-full"
            />
          </div>
        ) : (
          <div className="h-[200px] bg-[var(--muted)] flex items-center justify-center">
            <MapPin className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
        )}

        <div className="p-4">
          <h2 className="font-semibold text-[var(--foreground)] text-lg">
            {property?.addressLine1}
          </h2>
          <p className="text-[var(--muted-foreground)]">
            {property?.city}, {property?.state} {property?.zipCode}
          </p>

          <div className="flex gap-2 mt-3">
            <a
              href={
                property?.latitude && property?.longitude
                  ? `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property?.addressLine1} ${property?.city} ${property?.state} ${property?.zipCode}`)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors touch-manipulation"
            >
              <Navigation className="w-5 h-5" />
              Navigate
            </a>
            <button
              onClick={() => {
                const accessContact = job.accessContact as {
                  phone?: string;
                } | null;
                const phone = accessContact?.phone || null;
                if (phone) {
                  window.location.href = `tel:${phone}`;
                } else {
                  toast({
                    title: "Contact unavailable",
                    description:
                      "No contact phone number is available for this property.",
                  });
                }
              }}
              className="flex items-center justify-center px-4 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors touch-manipulation"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Job Info with Live Countdown */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">
          Job Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Payout</p>
              <p className="font-bold text-green-400 text-xl">
                ${Number(job.payoutAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--primary)]/20 rounded-lg">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Type</p>
              <p className="font-medium text-[var(--foreground)]">
                {job.jobType?.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Due Date</p>
              <p className="font-medium text-[var(--foreground)]">
                {job.slaDueAt
                  ? new Date(job.slaDueAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Live Countdown */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${urgency.bgClass || "bg-purple-500/20"}`}
            >
              <Clock
                className={`w-5 h-5 ${urgency.textClass || "text-purple-400"}`}
              />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Time Left
              </p>
              <p
                className={`font-bold text-xl ${urgency.textClass || "text-[var(--foreground)]"}`}
              >
                {countdown.timeRemaining}
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
            <p className="font-medium text-[var(--foreground)]">
              {property?.propertyType?.replace("_", " ") || "-"}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Sq Ft</p>
            <p className="font-medium text-[var(--foreground)]">
              {property?.sqft?.toLocaleString() || "-"}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Year Built</p>
            <p className="font-medium text-[var(--foreground)]">
              {property?.yearBuilt || "-"}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Bedrooms</p>
            <p className="font-medium text-[var(--foreground)]">
              {property?.bedrooms || "-"}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Bathrooms</p>
            <p className="font-medium text-[var(--foreground)]">
              {property?.bathrooms || "-"}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted-foreground)]">Lot Size</p>
            <p className="font-medium text-[var(--foreground)]">
              {property?.lotSizeSqft
                ? `${(property.lotSizeSqft / 43560).toFixed(2)} ac`
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {job.specialInstructions && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Special Instructions
          </h3>
          <p className="text-[var(--foreground)] text-sm">
            {job.specialInstructions}
          </p>
        </div>
      )}

      {/* Revision Request Alert */}
      {job.revisionRequested && job.revisionNotes && (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Revision Requested
          </h3>
          <p className="text-[var(--foreground)] text-sm">
            {job.revisionNotes}
          </p>
        </div>
      )}

      {/* Evidence Section */}
      {(job.status === "IN_PROGRESS" ||
        job.status === "SUBMITTED" ||
        job.status === "ACCEPTED") && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[var(--muted-foreground)]" />
            Evidence & Notes
          </h3>

          <Link
            href={`/appraiser/jobs/${id}/evidence`}
            className="flex items-center justify-between p-4 bg-[var(--secondary)] rounded-lg hover:bg-[var(--muted)] transition-colors mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Capture Evidence
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Take required photos
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          </Link>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Appraiser Notes
              </label>
              <button
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your inspection notes here... You can also use voice input."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
            {isListening && (
              <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Listening... Speak now
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cancel Button for Accepted Jobs */}
      {canCancel && (
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="w-full py-3 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/10 transition-colors"
        >
          Cancel This Job
        </button>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-[var(--card)] border-t border-[var(--border)] md:relative md:border-0 md:p-0 md:bg-transparent safe-area-bottom">
        {canAccept && (
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              acceptJob.mutate({ jobId: id });
            }}
            disabled={acceptJob.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-[var(--muted)] transition-colors touch-manipulation text-lg"
          >
            {acceptJob.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Check className="w-6 h-6" />
            )}
            Accept Job - ${Number(job.payoutAmount)}
          </button>
        )}

        {canStart && (
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  startJob.mutate({
                    jobId: id,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  });
                },
                () => {
                  startJob.mutate({ jobId: id, latitude: 0, longitude: 0 });
                },
              );
            }}
            disabled={startJob.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary)]/90 disabled:bg-[var(--muted)] transition-colors touch-manipulation text-lg"
          >
            {startJob.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Play className="w-6 h-6" />
            )}
            Start Inspection
          </button>
        )}

        {canSubmit && (
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(50);
              submitJob.mutate({ jobId: id, notes });
            }}
            disabled={submitJob.isPending}
            className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-[var(--muted)] transition-colors touch-manipulation text-lg"
          >
            {submitJob.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
            Submit for Review
          </button>
        )}

        {job.status === "COMPLETED" && (
          <div className="flex items-center justify-center gap-2 py-4 bg-green-500/20 text-green-400 rounded-xl font-semibold">
            <CheckCircle className="w-6 h-6" />
            Job Completed - ${Number(job.payoutAmount)} Earned
          </div>
        )}

        {job.status === "SUBMITTED" || job.status === "UNDER_REVIEW" ? (
          <div className="flex items-center justify-center gap-2 py-4 bg-orange-500/20 text-orange-400 rounded-xl font-semibold">
            <Clock className="w-6 h-6 animate-pulse" />
            Awaiting Review
          </div>
        ) : null}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Cancel This Job?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              The job will be returned to available jobs. Please provide a
              reason.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason("");
                }}
                className="flex-1 py-3 border border-[var(--border)] rounded-lg hover:bg-[var(--secondary)]"
              >
                Keep Job
              </button>
              <button
                onClick={() => {
                  if (!cancelReason.trim()) {
                    toast({
                      title: "Reason required",
                      description: "Please provide a reason for cancellation.",
                      variant: "destructive",
                    });
                    return;
                  }
                  cancelJob.mutate({ jobId: id, reason: cancelReason });
                }}
                disabled={cancelJob.isPending}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelJob.isPending ? "Cancelling..." : "Cancel Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
