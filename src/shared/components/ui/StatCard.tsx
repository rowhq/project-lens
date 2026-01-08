"use client";

import { cn } from "@/shared/lib/utils";

// Accent color configuration
const ACCENT_COLORS = {
  lime: {
    corner: "border-lime-400",
    text: "text-lime-400",
    bg: "bg-lime-400/10",
  },
  yellow: {
    corner: "border-yellow-400",
    text: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  green: {
    corner: "border-green-400",
    text: "text-green-400",
    bg: "bg-green-400/10",
  },
  blue: {
    corner: "border-blue-400",
    text: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  cyan: {
    corner: "border-cyan-400",
    text: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  emerald: {
    corner: "border-emerald-400",
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  purple: {
    corner: "border-purple-400",
    text: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  orange: {
    corner: "border-orange-400",
    text: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  red: {
    corner: "border-red-400",
    text: "text-red-400",
    bg: "bg-red-400/10",
  },
} as const;

type AccentColor = keyof typeof ACCENT_COLORS;

export interface StatCardProps {
  /** Label displayed above the value */
  label: string;
  /** Main value to display */
  value: number | string;
  /** Optional Lucide icon component */
  icon?: React.ElementType;
  /** Accent color for corners and icon */
  accentColor?: AccentColor;
  /** Additional class names */
  className?: string;
}

/**
 * StatCard - Primary stat display with L-bracket corners
 */
function StatCard({
  label,
  value,
  icon: Icon,
  accentColor = "lime",
  className,
}: StatCardProps) {
  const colors = ACCENT_COLORS[accentColor];

  return (
    <div
      className={cn(
        "relative group",
        "bg-[var(--card)] border border-[var(--border)]",
        "p-6 clip-notch",
        "hover:border-[var(--muted)] transition-colors",
        className,
      )}
    >
      {/* L-bracket corners */}
      <div
        className={cn(
          "absolute -top-px -left-px w-2 h-2 border-l border-t",
          colors.corner,
        )}
      />
      <div
        className={cn(
          "absolute -bottom-px -right-px w-2 h-2 border-r border-b opacity-30 group-hover:opacity-100 transition-opacity",
          colors.corner,
        )}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-label uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
            {label}
          </p>
          <p className="text-display-sm font-bold text-white tracking-tight">
            {value}
          </p>
        </div>
        {Icon && <Icon className={cn("w-5 h-5", colors.text)} />}
      </div>
    </div>
  );
}

export interface MetricCardProps {
  /** Label displayed below the icon */
  label: string;
  /** Main value to display */
  value: string | number;
  /** Required Lucide icon component */
  icon: React.ElementType;
  /** Accent color for icon background */
  accentColor?: AccentColor;
  /** Additional class names */
  className?: string;
}

/**
 * MetricCard - Compact metric display with icon box
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  accentColor = "lime",
  className,
}: MetricCardProps) {
  const colors = ACCENT_COLORS[accentColor];

  return (
    <div
      className={cn(
        "bg-[var(--card)] border border-[var(--border)]",
        "p-4 clip-notch-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2 clip-notch-sm", colors.text, colors.bg)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-mono text-label uppercase tracking-wider text-[var(--muted-foreground)]">
            {label}
          </p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export { StatCard, MetricCard, ACCENT_COLORS };
export type { AccentColor };
