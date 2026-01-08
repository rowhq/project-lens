"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle } from "lucide-react";

interface SLAProgressTrackerProps {
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
}

export function SLAProgressTracker({
  appraisal,
  job,
}: SLAProgressTrackerProps) {
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
      className={`clip-notch border p-6 ${isOverdue ? "bg-red-500/10 border-red-500/30" : "bg-[var(--card)] border-lime-400/30"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 clip-notch-sm flex items-center justify-center ${isOverdue ? "bg-red-500/20" : "bg-lime-400/20"}`}
          >
            <Clock
              className={`w-5 h-5 ${isOverdue ? "text-red-500" : "text-lime-400"}`}
            />
          </div>
          <div>
            <h3
              className={`font-semibold font-mono ${isOverdue ? "text-red-400" : "text-white"}`}
            >
              {isOverdue ? "Processing Delayed" : "Processing Your Request"}
            </h3>
            <p
              className={`text-sm ${isOverdue ? "text-red-400/70" : "text-[var(--muted-foreground)]"}`}
            >
              {timeLeft}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-bold font-mono ${isOverdue ? "text-red-500" : "text-lime-400"}`}
          >
            {Math.round(progress)}%
          </p>
          <p
            className={`text-xs font-mono uppercase tracking-wider ${isOverdue ? "text-red-500/70" : "text-lime-400/70"}`}
          >
            complete
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[var(--secondary)] clip-notch-sm overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-500 ${isOverdue ? "bg-red-500" : "bg-lime-400"}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div
                className={`w-6 h-6 clip-notch-sm flex items-center justify-center text-xs font-medium font-mono ${
                  step.complete
                    ? "bg-lime-400 text-black"
                    : idx === currentStepIdx
                      ? isOverdue
                        ? "bg-red-500 text-white"
                        : "bg-lime-400/50 text-black"
                      : "bg-gray-700 text-[var(--muted-foreground)]"
                }`}
              >
                {step.complete ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    step.complete ? "bg-lime-400" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-xs text-center font-mono ${
                step.complete
                  ? "text-lime-400 font-medium"
                  : "text-[var(--muted-foreground)]"
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
          className={`mt-4 text-sm text-center ${isOverdue ? "text-red-400" : "text-[var(--muted-foreground)]"}`}
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
