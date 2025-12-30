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

// Dark theme compatible status colors using opacity modifiers
const statusConfig: Record<StatusType, { label: string; variant: string }> = {
  // Appraisal statuses
  draft: { label: "Draft", variant: "bg-[var(--muted)] text-[var(--muted-foreground)]" },
  queued: { label: "Queued", variant: "bg-yellow-500/20 text-yellow-400" },
  running: { label: "Processing", variant: "bg-blue-500/20 text-blue-400" },
  ready: { label: "Ready", variant: "bg-green-500/20 text-green-400" },
  failed: { label: "Failed", variant: "bg-red-500/20 text-red-400" },
  expired: { label: "Expired", variant: "bg-[var(--muted)] text-[var(--muted-foreground)]" },

  // Job statuses
  pending_dispatch: { label: "Pending", variant: "bg-yellow-500/20 text-yellow-400" },
  dispatched: { label: "Dispatched", variant: "bg-blue-500/20 text-blue-400" },
  accepted: { label: "Accepted", variant: "bg-cyan-500/20 text-cyan-400" },
  in_progress: { label: "In Progress", variant: "bg-purple-500/20 text-purple-400" },
  submitted: { label: "Submitted", variant: "bg-indigo-500/20 text-indigo-400" },
  under_review: { label: "Under Review", variant: "bg-orange-500/20 text-orange-400" },
  completed: { label: "Completed", variant: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Cancelled", variant: "bg-red-500/20 text-red-400" },

  // Generic
  active: { label: "Active", variant: "bg-green-500/20 text-green-400" },
  inactive: { label: "Inactive", variant: "bg-[var(--muted)] text-[var(--muted-foreground)]" },
  pending: { label: "Pending", variant: "bg-yellow-500/20 text-yellow-400" },
  success: { label: "Success", variant: "bg-green-500/20 text-green-400" },
  error: { label: "Error", variant: "bg-red-500/20 text-red-400" },
  warning: { label: "Warning", variant: "bg-yellow-500/20 text-yellow-400" },
};

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "bg-[var(--muted)] text-[var(--muted-foreground)]" };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        config.variant,
        sizes[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Animated Status with Pulse
interface LiveStatusBadgeProps extends StatusBadgeProps {
  pulse?: boolean;
}

export function LiveStatusBadge({ status, pulse = true, ...props }: LiveStatusBadgeProps) {
  const isLive = ["running", "in_progress", "dispatched"].includes(status);

  return (
    <span className="relative inline-flex">
      {isLive && pulse && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]" />
        </span>
      )}
      <StatusBadge status={status} {...props} />
    </span>
  );
}
