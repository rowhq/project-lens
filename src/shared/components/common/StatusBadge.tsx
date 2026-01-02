"use client";

import { cn } from "@/shared/lib/utils";

type StatusType =
  // Appraisal statuses
  | "draft"
  | "queued"
  | "running"
  | "ready"
  | "failed"
  | "expired"
  // Job statuses
  | "pending_dispatch"
  | "dispatched"
  | "accepted"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "completed"
  | "cancelled"
  // Generic
  | "active"
  | "inactive"
  | "pending"
  | "success"
  | "error"
  | "warning";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md";
  className?: string;
}

// Ledger-style status colors with borders
const statusConfig: Record<
  StatusType,
  { label: string; variant: string; borderColor: string }
> = {
  // Appraisal statuses
  draft: {
    label: "DRAFT",
    variant: "bg-gray-500/10 text-gray-400",
    borderColor: "border-gray-500/30",
  },
  queued: {
    label: "QUEUED",
    variant: "bg-yellow-500/10 text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
  running: {
    label: "PROCESSING",
    variant: "bg-blue-500/10 text-blue-400",
    borderColor: "border-blue-500/30",
  },
  ready: {
    label: "READY",
    variant: "bg-lime-500/10 text-lime-400",
    borderColor: "border-lime-500/30",
  },
  failed: {
    label: "FAILED",
    variant: "bg-red-500/10 text-red-400",
    borderColor: "border-red-500/30",
  },
  expired: {
    label: "EXPIRED",
    variant: "bg-gray-500/10 text-gray-400",
    borderColor: "border-gray-500/30",
  },

  // Job statuses
  pending_dispatch: {
    label: "PENDING",
    variant: "bg-yellow-500/10 text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
  dispatched: {
    label: "DISPATCHED",
    variant: "bg-blue-500/10 text-blue-400",
    borderColor: "border-blue-500/30",
  },
  accepted: {
    label: "ACCEPTED",
    variant: "bg-cyan-500/10 text-cyan-400",
    borderColor: "border-cyan-500/30",
  },
  in_progress: {
    label: "IN PROGRESS",
    variant: "bg-purple-500/10 text-purple-400",
    borderColor: "border-purple-500/30",
  },
  submitted: {
    label: "SUBMITTED",
    variant: "bg-indigo-500/10 text-indigo-400",
    borderColor: "border-indigo-500/30",
  },
  under_review: {
    label: "UNDER REVIEW",
    variant: "bg-orange-500/10 text-orange-400",
    borderColor: "border-orange-500/30",
  },
  completed: {
    label: "COMPLETED",
    variant: "bg-lime-500/10 text-lime-400",
    borderColor: "border-lime-500/30",
  },
  cancelled: {
    label: "CANCELLED",
    variant: "bg-red-500/10 text-red-400",
    borderColor: "border-red-500/30",
  },

  // Generic
  active: {
    label: "ACTIVE",
    variant: "bg-lime-500/10 text-lime-400",
    borderColor: "border-lime-500/30",
  },
  inactive: {
    label: "INACTIVE",
    variant: "bg-gray-500/10 text-gray-400",
    borderColor: "border-gray-500/30",
  },
  pending: {
    label: "PENDING",
    variant: "bg-yellow-500/10 text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
  success: {
    label: "SUCCESS",
    variant: "bg-lime-500/10 text-lime-400",
    borderColor: "border-lime-500/30",
  },
  error: {
    label: "ERROR",
    variant: "bg-red-500/10 text-red-400",
    borderColor: "border-red-500/30",
  },
  warning: {
    label: "WARNING",
    variant: "bg-yellow-500/10 text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
};

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status.toUpperCase(),
    variant: "bg-gray-500/10 text-gray-400",
    borderColor: "border-gray-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-medium uppercase tracking-wider clip-notch-sm border",
        config.variant,
        config.borderColor,
        sizes[size],
        className,
      )}
    >
      {config.label}
    </span>
  );
}

// Animated Status with Pulse - Ledger Style
interface LiveStatusBadgeProps extends StatusBadgeProps {
  pulse?: boolean;
}

export function LiveStatusBadge({
  status,
  pulse = true,
  ...props
}: LiveStatusBadgeProps) {
  const isLive = ["running", "in_progress", "dispatched"].includes(status);

  return (
    <span className="relative inline-flex">
      {isLive && pulse && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full bg-lime-500 opacity-75"
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          />
          <span
            className="relative inline-flex h-2 w-2 bg-lime-500"
            style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
          />
        </span>
      )}
      <StatusBadge status={status} {...props} />
    </span>
  );
}
