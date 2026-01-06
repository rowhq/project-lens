"use client";

import { cn } from "@/shared/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "lime";
  size?: "sm" | "md";
}

function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  // Border colors for notch-border wrapper
  const borderColors = {
    default: "[--notch-border-color:var(--border)]",
    success: "[--notch-border-color:theme(colors.green.500/0.3)]",
    warning: "[--notch-border-color:theme(colors.yellow.500/0.3)]",
    error: "[--notch-border-color:theme(colors.red.500/0.3)]",
    info: "[--notch-border-color:theme(colors.blue.500/0.3)]",
    lime: "[--notch-border-color:theme(colors.lime.400/0.3)]",
  };

  // Background colors for inner element
  const bgColors = {
    default: "[--notch-bg:var(--muted)]",
    success: "[--notch-bg:theme(colors.green.500/0.1)]",
    warning: "[--notch-bg:theme(colors.yellow.500/0.1)]",
    error: "[--notch-bg:theme(colors.red.500/0.1)]",
    info: "[--notch-bg:theme(colors.blue.500/0.1)]",
    lime: "[--notch-bg:theme(colors.lime.400/0.1)]",
  };

  // Text colors
  const textColors = {
    default: "text-[var(--muted-foreground)]",
    success: "text-green-400",
    warning: "text-yellow-400",
    error: "text-red-400",
    info: "text-blue-400",
    lime: "text-lime-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-label",
    md: "px-3 py-1 text-caption",
  };

  return (
    <span
      className={cn(
        // Notch border wrapper
        "notch-border-sm inline-flex",
        borderColors[variant],
        bgColors[variant],
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "notch-border-sm-inner",
          "inline-flex items-center gap-1.5",
          "font-mono uppercase tracking-wider",
          textColors[variant],
          sizes[size],
        )}
      >
        {children}
      </span>
    </span>
  );
}

// Status dot for badges - Ledger diamond shape
function BadgeDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("w-1.5 h-1.5 bg-current animate-pulse", className)}
      style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
    />
  );
}

export { Badge, BadgeDot };
