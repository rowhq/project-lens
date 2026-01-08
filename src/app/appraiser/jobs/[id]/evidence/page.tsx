"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/shared/lib/trpc";
import { useToast } from "@/shared/hooks/use-toast";
import {
  ArrowLeft,
  Camera,
  X,
  Check,
  MapPin,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Info,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { PhotoExamplesModal } from "@/shared/components/common/PhotoExamplesModal";
import { compressImage, formatFileSize } from "@/shared/lib/image-compression";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface UploadedPhoto {
  url: string;
  evidenceId: string;
}

interface VoiceNote {
  id: string;
  url: string;
  evidenceId: string;
  duration: number;
  label: string;
  createdAt: Date;
}

const requiredPhotos = [
  {
    id: "front_exterior",
    label: "Front Exterior",
    description: "Full front view of the property",
  },
  {
    id: "rear_exterior",
    label: "Rear Exterior",
    description: "Full rear view of the property",
  },
  {
    id: "street_view",
    label: "Street View",
    description: "View of the street and neighborhood",
  },
  { id: "kitchen", label: "Kitchen", description: "Main kitchen area" },
  { id: "living_room", label: "Living Room", description: "Main living area" },
];

const optionalPhotos = [
  { id: "bathroom", label: "Bathroom", description: "Primary bathroom" },
  { id: "bedroom", label: "Primary Bedroom", description: "Master bedroom" },
  { id: "garage", label: "Garage", description: "Garage area" },
  {
    id: "backyard",
    label: "Backyard",
    description: "Backyard or outdoor space",
  },
  {
    id: "damage",
    label: "Damage/Issues",
    description: "Any visible damage or issues",
  },
];

export default function EvidenceCapturePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<
    Record<string, UploadedPhoto>
  >({});
  const [isUploading, setIsUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Failed uploads for retry functionality
  const [failedUploads, setFailedUploads] = useState<
    Record<string, { file: File; error: string }>
  >({});

  // Screen wake lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Photo examples modal state
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [selectedGuideCategory, setSelectedGuideCategory] =
    useState("front_exterior");

  // Voice note state
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice transcription state (Web Speech API)
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { data: job, refetch: refetchJob } = trpc.job.getById.useQuery({ id });
  const getUploadUrl = trpc.evidence.getUploadUrl.useMutation();
  const confirmEvidence = trpc.evidence.confirm.useMutation();
  const deleteEvidence = trpc.evidence.delete.useMutation();

  // Get geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Show user-friendly error message based on error code
          let errorMessage = "Unable to access your location.";
          let toastTitle = "Location unavailable";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions in your browser settings to verify you're at the property.";
              toastTitle = "Location permission denied";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage =
                "Location unavailable. Please check your device's GPS settings.";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              toastTitle = "Location timeout";
              break;
          }
          setError(errorMessage);
          toast({
            title: toastTitle,
            description: errorMessage,
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      const errorMessage =
        "Geolocation is not supported by this browser. Evidence cannot be geotagged.";
      setError(errorMessage);
      toast({
        title: "Geolocation not supported",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Request wake lock to keep screen on during evidence capture
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        // Wake lock request failed - usually due to low battery or page not visible
        console.log("Wake lock request failed:", err);
      }
    };

    requestWakeLock();

    // Re-request wake lock if page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        // Create blob from chunks
        const mimeType = mediaRecorder.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        // Upload the voice note
        await uploadVoiceNote(audioBlob, mimeType);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError(
        "Microphone access denied. Please allow microphone access to record voice notes.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const uploadVoiceNote = async (audioBlob: Blob, mimeType: string) => {
    setIsUploadingVoice(true);
    setError(null);

    try {
      const extension = mimeType.includes("webm") ? "webm" : "m4a";
      const fileName = `voice_note_${Date.now()}.${extension}`;

      // 1. Get presigned upload URL
      const uploadData = await getUploadUrl.mutateAsync({
        jobId: id,
        fileName,
        fileType: mimeType,
        fileSize: audioBlob.size,
        category: "voice_note",
      });

      // 2. Upload file to presigned URL
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: audioBlob,
        headers: {
          "Content-Type": mimeType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload voice note");
      }

      // 3. Confirm upload in database
      const evidence = await confirmEvidence.mutateAsync({
        jobId: id,
        fileKey: uploadData.fileKey,
        fileName,
        fileSize: audioBlob.size,
        mimeType,
        mediaType: "AUDIO",
        category: "voice_note",
        latitude: geolocation?.lat,
        longitude: geolocation?.lng,
        capturedAt: new Date().toISOString(),
      });

      // 4. Add to voice notes list
      const newVoiceNote: VoiceNote = {
        id: evidence.id,
        url: uploadData.publicUrl,
        evidenceId: evidence.id,
        duration: recordingDuration,
        label: `Voice Note ${voiceNotes.length + 1}`,
        createdAt: new Date(),
      };

      setVoiceNotes((prev) => [...prev, newVoiceNote]);
      setRecordingDuration(0);
      refetchJob();
    } catch (err) {
      console.error("Voice note upload failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to upload voice note",
      );
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const playVoiceNote = (note: VoiceNote) => {
    if (playingNoteId === note.id) {
      // Pause if currently playing
      audioRef.current?.pause();
      setPlayingNoteId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Create new audio element and play
    const audio = new Audio(note.url);
    audio.onended = () => setPlayingNoteId(null);
    audio.onerror = () => {
      setError("Failed to play voice note");
      setPlayingNoteId(null);
    };
    audioRef.current = audio;
    audio.play();
    setPlayingNoteId(note.id);
  };

  const deleteVoiceNote = async (note: VoiceNote) => {
    try {
      await deleteEvidence.mutateAsync({ evidenceId: note.evidenceId });
      setVoiceNotes((prev) => prev.filter((n) => n.id !== note.id));
      if (playingNoteId === note.id) {
        audioRef.current?.pause();
        setPlayingNoteId(null);
      }
      refetchJob();
    } catch (err) {
      console.error("Delete voice note failed:", err);
      setError("Failed to delete voice note");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Voice transcription functions (Web Speech API)
  const startTranscription = useCallback(() => {
    // Check for browser support
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (!SpeechRecognitionAPI) {
      setTranscriptionError(
        "Voice transcription is not supported in this browser. Try Chrome or Edge.",
      );
      return;
    }

    setTranscriptionError(null);
    setIsTranscribing(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscription((prev) => {
        // Append final transcripts, show interim in real-time
        if (finalTranscript) {
          return prev + finalTranscript;
        }
        // For interim, we just show current state + interim
        return prev + interimTranscript;
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      let errorMessage = "Voice transcription failed.";
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage =
            "Microphone not available. Please check your settings.";
          break;
        case "not-allowed":
          errorMessage =
            "Microphone access denied. Please allow microphone permissions.";
          break;
        case "network":
          errorMessage = "Network error. Please check your connection.";
          break;
      }
      setTranscriptionError(errorMessage);
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      setIsTranscribing(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopTranscription = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsTranscribing(false);
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscription("");
    setTranscriptionError(null);
  }, []);

  // Core upload function that can be called for both new uploads and retries
  const uploadFile = useCallback(
    async (file: File, category: string) => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // 1. Compress image before upload (for images over 500KB)
        let processedFile = file;
        if (file.type.startsWith("image/") && file.size > 500 * 1024) {
          setUploadProgress(5);
          try {
            processedFile = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1920,
              maxSizeMB: 1,
              quality: 0.85,
            });
            console.log(
              `Compressed ${formatFileSize(file.size)} to ${formatFileSize(processedFile.size)}`,
            );
          } catch (compressionError) {
            console.warn(
              "Image compression failed, using original:",
              compressionError,
            );
            processedFile = file;
          }
        }

        setUploadProgress(15);

        // 2. Get presigned upload URL
        const uploadData = await getUploadUrl.mutateAsync({
          jobId: id,
          fileName: processedFile.name,
          fileType: processedFile.type,
          fileSize: processedFile.size,
          category: category,
        });

        setUploadProgress(25);

        // 3. Upload file to presigned URL with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: "PUT",
          body: processedFile,
          headers: {
            "Content-Type": processedFile.type,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file to storage");
        }

        setUploadProgress(75);

        // 4. Confirm upload in database
        const evidence = await confirmEvidence.mutateAsync({
          jobId: id,
          fileKey: uploadData.fileKey,
          fileName: processedFile.name,
          fileSize: processedFile.size,
          mimeType: processedFile.type,
          mediaType: "PHOTO",
          category: category,
          latitude: geolocation?.lat,
          longitude: geolocation?.lng,
          capturedAt: new Date().toISOString(),
        });

        setUploadProgress(100);

        // 5. Store the uploaded photo and clear any failed upload for this category
        setUploadedPhotos((prev) => ({
          ...prev,
          [category]: {
            url: uploadData.publicUrl,
            evidenceId: evidence.id,
          },
        }));

        // Clear failed upload if exists
        setFailedUploads((prev) => {
          const newFailed = { ...prev };
          delete newFailed[category];
          return newFailed;
        });

        // Refetch job to update evidence count
        refetchJob();
      } catch (err) {
        console.error("Upload failed:", err);
        const errorMessage =
          err instanceof Error
            ? err.name === "AbortError"
              ? "Upload timed out. Please try again."
              : err.message
            : "Upload failed. Please try again.";

        // Store failed upload for retry
        setFailedUploads((prev) => ({
          ...prev,
          [category]: { file, error: errorMessage },
        }));

        setError(errorMessage);
      } finally {
        setIsUploading(false);
        setActiveCategory(null);
        setUploadProgress(0);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [id, geolocation, getUploadUrl, confirmEvidence, refetchJob],
  );

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !activeCategory) return;
    await uploadFile(file, activeCategory);
  };

  // Retry failed upload
  const retryUpload = useCallback(
    async (category: string) => {
      const failedUpload = failedUploads[category];
      if (!failedUpload) return;

      setActiveCategory(category);
      await uploadFile(failedUpload.file, category);
    },
    [failedUploads, uploadFile],
  );

  const handleCapture = (category: string) => {
    setActiveCategory(category);
    setError(null);
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const openPhotoGuide = (category: string) => {
    setSelectedGuideCategory(category);
    setShowPhotoGuide(true);
  };

  const handleDelete = async (category: string) => {
    const photo = uploadedPhotos[category];
    if (!photo) return;

    try {
      await deleteEvidence.mutateAsync({ evidenceId: photo.evidenceId });
      setUploadedPhotos((prev) => {
        const newPhotos = { ...prev };
        delete newPhotos[category];
        return newPhotos;
      });
      refetchJob();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete photo. Please try again.");
    }
  };

  const completedRequired = requiredPhotos.filter(
    (p) => uploadedPhotos[p.id],
  ).length;
  const allRequiredComplete = completedRequired === requiredPhotos.length;

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Hidden file input for camera/gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[var(--muted)] rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Evidence Capture
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {job?.property?.addressLine1}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="text-sm text-red-400">{error}</div>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Failed Uploads with Retry */}
      {Object.keys(failedUploads).length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <h3 className="font-medium text-amber-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Failed Uploads
          </h3>
          <div className="space-y-2">
            {Object.entries(failedUploads).map(
              ([category, { file, error: uploadError }]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)]">
                      {category
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)] truncate">
                      {file.name} ({formatFileSize(file.size)})
                    </p>
                    <p className="text-xs text-red-400 mt-1">{uploadError}</p>
                  </div>
                  <button
                    onClick={() => retryUpload(category)}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-400 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isUploading && activeCategory === category ? "animate-spin" : ""}`}
                    />
                    Retry
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Uploading...
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-2">
            <div
              className="h-2 rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--foreground)]">
            Required Photos
          </span>
          <span className="text-sm text-[var(--muted-foreground)]">
            {completedRequired} of {requiredPhotos.length} complete
          </span>
        </div>
        <div className="w-full bg-[var(--muted)] rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              allRequiredComplete ? "bg-green-500" : "bg-[var(--primary)]"
            }`}
            style={{
              width: `${(completedRequired / requiredPhotos.length) * 100}%`,
            }}
          />
        </div>
        {allRequiredComplete && (
          <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" />
            All required photos captured
          </p>
        )}
      </div>

      {/* Geolocation Notice */}
      <div className="bg-[var(--primary)]/20 border border-[var(--primary)]/30 rounded-lg p-3 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-[var(--primary)]">
            Location Tracking Active
          </p>
          <p className="text-[var(--primary)]/80">
            Photos will be geotagged to verify you&apos;re at the property
            location.
          </p>
        </div>
      </div>

      {/* Required Photos */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--foreground)]">
            Required Photos
          </h2>
          <button
            onClick={() => openPhotoGuide("front_exterior")}
            className="flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
          >
            <HelpCircle className="w-4 h-4" />
            Photo Guide
          </button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {requiredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openPhotoGuide(photo.id)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    uploadedPhotos[photo.id]
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-[var(--muted)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  {uploadedPhotos[photo.id] ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[var(--muted-foreground)]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--foreground)]">
                      {photo.label}
                    </p>
                    <button
                      onClick={() => openPhotoGuide(photo.id)}
                      className="p-1 hover:bg-[var(--muted)] rounded-full"
                      title="View photo guide"
                    >
                      <Info className="w-4 h-4 text-[var(--muted-foreground)]" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {photo.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCapture(photo.id)}
                disabled={isUploading && activeCategory === photo.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  uploadedPhotos[photo.id]
                    ? "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    : "bg-[var(--primary)] text-black font-medium hover:bg-[var(--primary)]/90"
                }`}
              >
                {isUploading && activeCategory === photo.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : uploadedPhotos[photo.id] ? (
                  <>
                    <Camera className="w-4 h-4" />
                    Retake
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Capture
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Photos */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">
            Optional Photos
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Additional photos to enhance the report
          </p>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {optionalPhotos.map((photo) => (
            <div
              key={photo.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openPhotoGuide(photo.id)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    uploadedPhotos[photo.id]
                      ? "bg-green-500/20 hover:bg-green-500/30"
                      : "bg-[var(--muted)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  {uploadedPhotos[photo.id] ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[var(--muted-foreground)]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--foreground)]">
                      {photo.label}
                    </p>
                    <button
                      onClick={() => openPhotoGuide(photo.id)}
                      className="p-1 hover:bg-[var(--muted)] rounded-full"
                      title="View photo guide"
                    >
                      <Info className="w-4 h-4 text-[var(--muted-foreground)]" />
                    </button>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {photo.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCapture(photo.id)}
                disabled={isUploading && activeCategory === photo.id}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg font-medium text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
              >
                {isUploading && activeCategory === photo.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : uploadedPhotos[photo.id] ? (
                  <>
                    <Camera className="w-4 h-4" />
                    Retake
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Add
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Notes */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">
            Voice Notes
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Record observations about the property
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4">
            {isRecording ? (
              <>
                {/* Audio Level Visualizer */}
                <div className="flex items-end justify-center gap-1 h-10 w-full max-w-xs">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-red-500 rounded-full motion-safe:animate-audio-bar"
                      style={{
                        height: `${20 + (i % 3) * 25 + Math.sin(i) * 15}%`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-red-500/20 rounded-full">
                    <div className="w-3 h-3 rounded-full bg-red-500 motion-safe:animate-pulse" />
                    <span className="text-red-400 font-medium font-mono">
                      {formatDuration(recordingDuration)}
                    </span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700"
                  >
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </button>
                </div>
              </>
            ) : isUploadingVoice ? (
              <div className="flex items-center gap-3 px-6 py-3 bg-[var(--muted)] rounded-full">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
                <span className="text-[var(--foreground)] font-medium">
                  Uploading voice note...
                </span>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-black font-medium rounded-full font-medium hover:bg-[var(--primary)]/90"
              >
                <Mic className="w-5 h-5" />
                Record Voice Note
              </button>
            )}
          </div>

          {/* Voice Notes List */}
          {voiceNotes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-[var(--muted-foreground)] font-medium">
                Recorded Notes
              </p>
              {voiceNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => playVoiceNote(note)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        playingNoteId === note.id
                          ? "bg-[var(--primary)] text-black font-medium"
                          : "bg-[var(--secondary)] text-[var(--foreground)]"
                      }`}
                    >
                      {playingNoteId === note.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {note.label}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {formatDuration(note.duration)}{" "}
                        <span className="mx-1">|</span>
                        {note.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteVoiceNote(note)}
                    disabled={deleteEvidence.isPending}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    {deleteEvidence.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {voiceNotes.length === 0 && !isRecording && !isUploadingVoice && (
            <p className="text-center text-sm text-[var(--muted-foreground)] py-2">
              No voice notes recorded yet. Record observations about the
              property condition, notable features, or issues.
            </p>
          )}
        </div>
      </div>

      {/* Voice Transcription Section */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">
            Voice-to-Text Notes
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Dictate notes and they&apos;ll be converted to text
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Transcription Error */}
          {transcriptionError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{transcriptionError}</p>
              </div>
              <button onClick={() => setTranscriptionError(null)}>
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}

          {/* Transcription Controls */}
          <div className="flex items-center justify-center gap-4">
            {isTranscribing ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/20 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-blue-500 motion-safe:animate-pulse" />
                  <span className="text-blue-400 font-medium">
                    Listening...
                  </span>
                </div>
                <button
                  onClick={stopTranscription}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </button>
              </>
            ) : (
              <button
                onClick={startTranscription}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600"
              >
                <Mic className="w-5 h-5" />
                Start Dictation
              </button>
            )}
          </div>

          {/* Transcription Text Area */}
          <div className="space-y-2">
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Your transcribed notes will appear here. You can also type or edit directly..."
              rows={4}
              className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--secondary)] text-[var(--foreground)] resize-none"
            />
            {transcription && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--muted-foreground)]">
                  {transcription.split(/\s+/).filter(Boolean).length} words
                </p>
                <button
                  onClick={clearTranscription}
                  className="text-sm text-red-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-[var(--muted-foreground)] text-center">
            Voice transcription works best with Chrome or Edge browsers. Speak
            clearly for best results.
          </p>
        </div>
      </div>

      {/* Preview Grid */}
      {Object.keys(uploadedPhotos).length > 0 && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4">
          <h2 className="font-semibold text-[var(--foreground)] mb-3">
            Captured Photos
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(uploadedPhotos).map(([category, photo]) => (
              <div
                key={category}
                className="relative aspect-square bg-[var(--muted)] rounded-lg overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={category.replace("_", " ")}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-[var(--muted-foreground)]" />
                </div>
                <button
                  onClick={() => handleDelete(category)}
                  disabled={deleteEvidence.isPending}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteEvidence.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
                <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                  {category.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done Button */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-[var(--card)] border-t border-[var(--border)]">
        <button
          onClick={() => router.back()}
          disabled={!allRequiredComplete}
          className={`w-full py-3 rounded-lg font-semibold ${
            allRequiredComplete
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
          }`}
        >
          {allRequiredComplete ? (
            <>
              <Check className="w-5 h-5 inline mr-2" />
              Done - Return to Job
            </>
          ) : (
            `${requiredPhotos.length - completedRequired} Required Photos Remaining`
          )}
        </button>
      </div>

      {/* Photo Examples Modal */}
      <PhotoExamplesModal
        isOpen={showPhotoGuide}
        onClose={() => setShowPhotoGuide(false)}
        categoryId={selectedGuideCategory}
      />
    </div>
  );
}
