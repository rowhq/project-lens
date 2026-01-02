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
  const variants = {
    default: "bg-gray-800 text-gray-300 border-gray-700",
    success: "bg-green-500/10 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    error: "bg-red-500/10 text-red-400 border-red-500/30",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    lime: "bg-lime-400/10 text-lime-400 border-lime-400/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-label",
    md: "px-3 py-1 text-caption",
  };

  return (
    <span
      className={cn(
        // Base styles
        "inline-flex items-center gap-1.5",
        "font-mono uppercase tracking-wider",
        "border",
        // Angular design
        "clip-notch-sm",
        // Variant and size
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
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
