"use client";

import { cn } from "@/shared/lib/utils";

/**
 * Ledger-style decorative components
 * L-bracket corners, separators, and markers
 */

// L-Bracket Corners - The signature Ledger visual element
// Creates L-shaped corners like [ ] around a container
export function LedgerBrackets({
  className,
  color = "gray",
  size = "md",
  children,
}: {
  className?: string;
  color?: "lime" | "white" | "gray";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}) {
  const colorClasses = {
    lime: "border-lime-400",
    white: "border-white",
    gray: "border-gray-600",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={cn("relative", className)}>
      {/* Top-left L-bracket */}
      <span
        className={cn(
          "absolute top-0 left-0 border-t border-l",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      {/* Top-right L-bracket */}
      <span
        className={cn(
          "absolute top-0 right-0 border-t border-r",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      {/* Bottom-left L-bracket */}
      <span
        className={cn(
          "absolute bottom-0 left-0 border-b border-l",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      {/* Bottom-right L-bracket */}
      <span
        className={cn(
          "absolute bottom-0 right-0 border-b border-r",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      {children}
    </div>
  );
}

// Just the corner elements without wrapper (for use inside existing containers)
export function LedgerCorners({
  color = "gray",
  size = "md",
}: {
  color?: "lime" | "white" | "gray";
  size?: "sm" | "md" | "lg";
}) {
  const colorClasses = {
    lime: "border-lime-400",
    white: "border-white",
    gray: "border-gray-600",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <>
      <span
        className={cn(
          "absolute top-0 left-0 border-t border-l pointer-events-none",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      <span
        className={cn(
          "absolute top-0 right-0 border-t border-r pointer-events-none",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      <span
        className={cn(
          "absolute bottom-0 left-0 border-b border-l pointer-events-none",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
      <span
        className={cn(
          "absolute bottom-0 right-0 border-b border-r pointer-events-none",
          sizeClasses[size],
          colorClasses[color],
        )}
      />
    </>
  );
}

// Navigation Separator - vertical line between nav items
export function NavSeparator({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block w-px h-3 bg-gray-600 mx-4 align-middle",
        className,
      )}
    />
  );
}

// Horizontal Line Separator
export function LineSeparator({
  className,
  variant = "solid",
  color = "gray",
}: {
  className?: string;
  variant?: "solid" | "dashed" | "gradient";
  color?: "lime" | "white" | "gray";
}) {
  const colorClasses = {
    lime: "border-lime-400/30",
    white: "border-white/20",
    gray: "border-gray-700",
  };

  if (variant === "gradient") {
    return (
      <div
        className={cn("h-px w-full", className)}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${
            color === "lime"
              ? "#4ADE80"
              : color === "white"
                ? "#FFFFFF"
                : "#374151"
          }40 50%, transparent 100%)`,
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "h-px w-full border-t",
        colorClasses[color],
        variant === "dashed" && "border-dashed",
        className,
      )}
    />
  );
}

// Status Square Indicator ■
export function StatusSquare({
  className,
  color = "lime",
  pulse = false,
}: {
  className?: string;
  color?: "lime" | "white" | "amber" | "red";
  pulse?: boolean;
}) {
  const colorClasses = {
    lime: "bg-lime-400",
    white: "bg-white",
    amber: "bg-amber-400",
    red: "bg-red-500",
  };

  return (
    <span
      className={cn(
        "inline-block w-1.5 h-1.5",
        colorClasses[color],
        pulse && "animate-pulse",
        className,
      )}
    />
  );
}

// Expand Indicator [+]
export function ExpandIndicator({
  expanded = false,
  className,
}: {
  expanded?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-xs text-lime-400", className)}>
      [{expanded ? "-" : "+"}]
    </span>
  );
}

// Crosshair Marker [ : ]
export function CrosshairMarker({ className }: { className?: string }) {
  return (
    <span className={cn("font-mono text-xs text-gray-500", className)}>
      [ : ]
    </span>
  );
}

// Section Divider with optional label
export function SectionDivider({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <LineSeparator variant="gradient" color="lime" className="flex-1" />
      {label ? (
        <span className="font-mono text-xs uppercase tracking-wider text-gray-500 px-2">
          {label}
        </span>
      ) : (
        <CrosshairMarker />
      )}
      <LineSeparator variant="gradient" color="lime" className="flex-1" />
    </div>
  );
}

// Grid Background Pattern
export function GridPattern({
  className,
  opacity = 0.03,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        opacity,
        backgroundImage: `
          linear-gradient(to right, #4ADE80 1px, transparent 1px),
          linear-gradient(to bottom, #4ADE80 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    />
  );
}

// Scanline Effect
export function Scanlines({
  className,
  opacity = 0.02,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        opacity,
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.03) 2px,
          rgba(255, 255, 255, 0.03) 4px
        )`,
      }}
    />
  );
}

// Legacy exports for backwards compatibility
export const BracketCorners = LedgerCorners;
export const NotchDecorator = StatusSquare;

export function CornerAccent({
  position = "top-left",
  color = "lime",
  size = 16,
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: "lime" | "white" | "gray";
  size?: number;
}) {
  const colorMap = {
    lime: "border-lime-400",
    white: "border-white",
    gray: "border-gray-600",
  };

  const positionClasses = {
    "top-left": "top-0 left-0 border-t border-l",
    "top-right": "top-0 right-0 border-t border-r",
    "bottom-left": "bottom-0 left-0 border-b border-l",
    "bottom-right": "bottom-0 right-0 border-b border-r",
  };

  return (
    <span
      className={cn(
        "absolute pointer-events-none",
        positionClasses[position],
        colorMap[color],
      )}
      style={{ width: size, height: size }}
    />
  );
}

export function ClippedButtonBorder({
  className: _className,
  hover: _hover = false,
}: {
  className?: string;
  hover?: boolean;
}) {
  // Deprecated - use ledger-brackets class instead
  return null;
}
