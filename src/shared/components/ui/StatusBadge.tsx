"use client";

import { cn } from "@/shared/lib/utils";

// Status configuration with colors
const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label?: string }
> = {
  // Generic statuses
  READY: { bg: "bg-lime-400/10 border-lime-400/30", text: "text-lime-400" },
  RUNNING: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400" },
  FAILED: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400" },
  DRAFT: { bg: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" },
  QUEUED: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-400",
  },

  // Appraisal statuses
  PENDING_PAYMENT: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-400",
    label: "Pending Payment",
  },
  ASSIGNED: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400" },
  IN_PROGRESS: {
    bg: "bg-purple-500/10 border-purple-500/30",
    text: "text-purple-400",
    label: "In Progress",
  },
  UNDER_REVIEW: {
    bg: "bg-orange-500/10 border-orange-500/30",
    text: "text-orange-400",
    label: "Under Review",
  },
  COMPLETED: { bg: "bg-lime-400/10 border-lime-400/30", text: "text-lime-400" },
  CANCELLED: { bg: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" },
  DISPUTED: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400" },

  // Order statuses
  PENDING: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-400",
  },
  PROCESSING: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
  },
  DELIVERED: { bg: "bg-lime-400/10 border-lime-400/30", text: "text-lime-400" },
  REFUNDED: { bg: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" },

  // Job statuses
  AVAILABLE: { bg: "bg-lime-400/10 border-lime-400/30", text: "text-lime-400" },
  ACCEPTED: { bg: "bg-blue-500/10 border-blue-500/30", text: "text-blue-400" },

  // Boolean-like statuses
  ACTIVE: { bg: "bg-lime-400/10 border-lime-400/30", text: "text-lime-400" },
  INACTIVE: { bg: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" },
  ENABLED: { bg: "bg-lime-400/10 border-lime-400/30", text: "text-lime-400" },
  DISABLED: { bg: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" },

  // Priority/urgency
  HIGH: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400" },
  MEDIUM: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    text: "text-yellow-400",
  },
  LOW: { bg: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" },

  // Default fallback
  DEFAULT: { bg: "bg-gray-500/10 border-gray-500/30", text: "text-gray-400" },
};

export interface StatusBadgeProps {
  /** Status string (e.g., "READY", "PENDING", "IN_PROGRESS") */
  status: string;
  /** Override the display label */
  label?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional icon to show before the label */
  icon?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

function StatusBadge({
  status,
  label,
  size = "md",
  icon,
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT;

  // Use provided label, or config label, or format status string
  const displayLabel = label ?? config.label ?? formatStatusLabel(status);

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-label",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        "font-mono uppercase tracking-wider",
        "border clip-notch-sm",
        sizeClasses[size],
        config.bg,
        config.text,
        className,
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {displayLabel}
    </span>
  );
}

/** Format status string to human readable (e.g., "IN_PROGRESS" -> "In Progress") */
function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export { StatusBadge, STATUS_CONFIG };
