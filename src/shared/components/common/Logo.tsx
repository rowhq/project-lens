/**
 * Shared Logo Component
 * Centralized branding with variants for different contexts
 */

import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white";
  badge?: string;
  badgeColor?: string;
  className?: string;
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Logo({
  href = "/dashboard",
  size = "md",
  variant = "primary",
  badge,
  badgeColor = "bg-amber-500",
  className,
}: LogoProps) {
  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-bold",
          sizeClasses[size],
          variant === "primary" ? "text-[var(--primary)]" : "text-white"
        )}
      >
        TruPlat
      </span>
      {badge && (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs font-semibold",
            badgeColor,
            variant === "primary" ? "text-white" : "text-[var(--background)]"
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
