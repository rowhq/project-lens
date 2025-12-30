"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/shared/components/ui/Button";

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  file: File;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  type: string;
}

export interface CameraCaptureProps {
  onCapture: (photo: CapturedPhoto) => void;
  onClose?: () => void;
  requireGPS?: boolean;
  targetLocation?: {
    latitude: number;
    longitude: number;
  };
  maxDistanceMeters?: number;
  photoType?: string;
  className?: string;
}

export function CameraCapture({
  onCapture,
  onClose,
  requireGPS = true,
  targetLocation,
  maxDistanceMeters = 100,
  photoType = "general",
  className = "",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [flash, setFlash] = useState(false);

  // Calculate distance between two points
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    },
    []
  );

  // Check if current location is within range of target
  const isWithinRange = useCallback(() => {
    if (!targetLocation || !location) return true;

    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    return distance <= maxDistanceMeters;
  }, [location, targetLocation, maxDistanceMeters, calculateDistance]);

  // Get current location
  useEffect(() => {
    if (!requireGPS) return;

    let watchId: number;

    const getLocation = () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported");
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation(position);
          setLocationError(null);
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setLocationError("Location permission denied");
              break;
            case err.POSITION_UNAVAILABLE:
              setLocationError("Location unavailable");
              break;
            case err.TIMEOUT:
              setLocationError("Location request timed out");
              break;
            default:
              setLocationError("Unable to get location");
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 10000,
        }
      );
    };

    getLocation();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [requireGPS]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera permission denied");
        } else if (err.name === "NotFoundError") {
          setError("No camera found");
        } else {
          setError("Failed to access camera");
        }
      }
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  // Switch camera
  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stopCamera]);

  // Restart camera after facing mode change
  useEffect(() => {
    if (isActive) {
      startCamera();
    }
  }, [facingMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (requireGPS && !location) {
      setError("Waiting for GPS location...");
      return;
    }
    if (targetLocation && !isWithinRange()) {
      setError(`You must be within ${maxDistanceMeters}m of the property`);
      return;
    }

    setIsCapturing(true);

    // Flash effect
    if (flash) {
      setFlash(true);
      setTimeout(() => setFlash(false), 100);
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Add timestamp overlay
      const timestamp = new Date();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      ctx.fillStyle = "white";
      ctx.font = "16px monospace";
      ctx.fillText(
        timestamp.toLocaleString(),
        10,
        canvas.height - 35
      );

      if (location) {
        ctx.fillText(
          `GPS: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)} (±${Math.round(location.coords.accuracy)}m)`,
          10,
          canvas.height - 15
        );
      }

      // Convert to blob and file
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const file = new File([blob], `${id}.jpg`, { type: "image/jpeg" });
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

          const photo: CapturedPhoto = {
            id,
            dataUrl,
            file,
            timestamp,
            type: photoType,
            ...(location && {
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
              },
            }),
          };

          onCapture(photo);
          setIsCapturing(false);
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture photo");
      setIsCapturing(false);
    }
  }, [location, requireGPS, targetLocation, isWithinRange, maxDistanceMeters, photoType, onCapture, flash]);

  // Distance display
  const distanceToTarget = useCallback(() => {
    if (!targetLocation || !location) return null;

    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    return Math.round(distance);
  }, [location, targetLocation, calculateDistance]);

  return (
    <div className={`relative bg-black ${className}`}>
      {/* Video preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Canvas for capture (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash effect */}
      {flash && (
        <div className="absolute inset-0 bg-white z-50 animate-pulse" />
      )}

      {/* GPS status overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
          {locationError ? (
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {locationError}
            </div>
          ) : location ? (
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              GPS Active (±{Math.round(location.coords.accuracy)}m)
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400">
              <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Acquiring GPS...
            </div>
          )}
        </div>

        {targetLocation && location && (
          <div
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              isWithinRange()
                ? "bg-green-500/80 text-white"
                : "bg-red-500/80 text-white"
            }`}
          >
            {distanceToTarget()}m from property
          </div>
        )}
      </div>

      {/* Photo type label */}
      <div className="absolute top-16 left-4 bg-blue-500/80 text-white px-3 py-1 rounded text-sm font-medium capitalize">
        {photoType.replace(/_/g, " ")}
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Capture button */}
          <div className="flex-1 flex justify-center">
            {!isActive ? (
              <Button
                onClick={startCamera}
                size="lg"
                className="px-8"
              >
                Start Camera
              </Button>
            ) : (
              <button
                onClick={capturePhoto}
                disabled={isCapturing || (requireGPS && !location) || (targetLocation && !isWithinRange())}
                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCapturing ? (
                  <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white" />
                )}
              </button>
            )}
          </div>

          {/* Switch camera button */}
          {isActive && (
            <button
              onClick={switchCamera}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraCapture;
