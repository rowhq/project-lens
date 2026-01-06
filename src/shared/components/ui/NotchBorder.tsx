"use client";

import { cn } from "@/shared/lib/utils";

type NotchSize = "xs" | "sm" | "md" | "lg";

interface NotchBorderProps {
  size?: NotchSize;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}

const outerClasses: Record<NotchSize, string> = {
  xs: "notch-border-xs",
  sm: "notch-border-sm",
  md: "notch-border",
  lg: "notch-border-lg",
};

const innerClasses: Record<NotchSize, string> = {
  xs: "notch-border-xs-inner",
  sm: "notch-border-sm-inner",
  md: "notch-border-inner",
  lg: "notch-border-lg-inner",
};

/**
 * NotchBorder Component
 *
 * Wraps content with a notched border that follows the clip-path shape.
 * Uses the wrapper technique where outer element background = border color,
 * and inner element has the actual background.
 *
 * CSS variables for customization:
 * - --notch-border-color: Border color (default: var(--border))
 * - --notch-bg: Inner background color (default: var(--background))
 * - --notch-border-width: Border thickness (default: 1px)
 *
 * @example
 * <NotchBorder size="md" className="[--notch-border-color:theme(colors.lime.500)]">
 *   Content here
 * </NotchBorder>
 */
export function NotchBorder({
  size = "md",
  className,
  innerClassName,
  children,
}: NotchBorderProps) {
  return (
    <div className={cn(outerClasses[size], className)}>
      <span className={cn(innerClasses[size], innerClassName)}>{children}</span>
    </div>
  );
}

/**
 * NotchClip Component
 *
 * Simple clip-notch without border wrapper.
 * Use when you only need the notched shape without a border.
 */
export function NotchClip({
  size = "md",
  className,
  children,
}: {
  size?: NotchSize;
  className?: string;
  children: React.ReactNode;
}) {
  const clipClasses: Record<NotchSize, string> = {
    xs: "clip-notch-sm", // xs uses sm clip
    sm: "clip-notch-sm",
    md: "clip-notch",
    lg: "clip-notch-lg",
  };

  return <div className={cn(clipClasses[size], className)}>{children}</div>;
}
