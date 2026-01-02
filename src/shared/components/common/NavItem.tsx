/**
 * Shared Navigation Item Component
 * Used across sidebar, bottom nav, and admin navigation
 */

"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  variant?: "sidebar" | "bottom" | "admin";
  badge?: number | null;
  badgeColor?: string;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  sidebar: {
    base: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active: "bg-[var(--primary)]/10 text-[var(--primary)]",
    inactive: "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
    iconActive: "text-[var(--primary)]",
    iconInactive: "text-[var(--muted-foreground)]",
  },
  admin: {
    base: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active: "bg-[var(--secondary)] text-[var(--foreground)]",
    inactive: "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]",
    iconActive: "text-[var(--foreground)]",
    iconInactive: "text-[var(--muted-foreground)]",
  },
  bottom: {
    base: "flex flex-1 flex-col items-center justify-center gap-1 py-2 relative",
    active: "text-[var(--primary)]",
    inactive: "text-[var(--muted-foreground)]",
    iconActive: "text-[var(--primary)]",
    iconInactive: "text-[var(--muted-foreground)]",
  },
};

export function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  variant = "sidebar",
  badge,
  badgeColor = "bg-red-500",
  size = "md",
  onClick,
  className,
}: NavItemProps) {
  const styles = variantStyles[variant];
  const iconSize = size === "sm" || variant === "bottom" ? "h-5 w-5" : "h-5 w-5";
  const showBadge = badge !== null && badge !== undefined && badge > 0;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        styles.base,
        isActive ? styles.active : styles.inactive,
        className
      )}
    >
      {variant === "bottom" ? (
        <>
          <div className="relative">
            <Icon className={cn(iconSize, isActive ? styles.iconActive : styles.iconInactive)} />
            {showBadge && (
              <span
                className={cn(
                  "absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1",
                  badgeColor
                )}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">{label}</span>
        </>
      ) : (
        <>
          <div className="relative">
            <Icon className={cn(iconSize, isActive ? styles.iconActive : styles.iconInactive)} />
            {showBadge && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1",
                  badgeColor
                )}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </div>
          {label}
        </>
      )}
    </Link>
  );
}
