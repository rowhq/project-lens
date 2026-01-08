"use client";

import { cn } from "@/shared/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Main title/heading */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional primary action */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      icon: "w-12 h-12",
      title: "text-lg",
      description: "text-sm",
      padding: "py-8",
    },
    md: {
      icon: "w-16 h-16",
      title: "text-xl",
      description: "text-base",
      padding: "py-16",
    },
    lg: {
      icon: "w-20 h-20",
      title: "text-2xl",
      description: "text-lg",
      padding: "py-24",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("text-center", config.padding, className)}>
      {/* Icon */}
      <Icon
        className={cn(
          config.icon,
          "mx-auto text-[var(--muted-foreground)] opacity-60",
        )}
        strokeWidth={1.5}
      />

      {/* Title */}
      <p
        className={cn(
          "mt-4 font-semibold text-[var(--foreground)]",
          config.title,
        )}
      >
        {title}
      </p>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "mt-2 text-[var(--muted-foreground)]",
            config.description,
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {action && (
            <>
              {action.href ? (
                <Link
                  href={action.href}
                  className={cn(
                    "inline-flex items-center gap-2",
                    "px-4 py-2.5",
                    "bg-lime-400 text-gray-900",
                    "font-mono text-sm font-semibold uppercase tracking-wider",
                    "clip-notch",
                    "hover:bg-lime-300 transition-colors",
                  )}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className={cn(
                    "inline-flex items-center gap-2",
                    "px-4 py-2.5",
                    "bg-lime-400 text-gray-900",
                    "font-mono text-sm font-semibold uppercase tracking-wider",
                    "clip-notch",
                    "hover:bg-lime-300 transition-colors",
                  )}
                >
                  {action.label}
                </button>
              )}
            </>
          )}

          {secondaryAction && (
            <>
              {secondaryAction.href ? (
                <Link
                  href={secondaryAction.href}
                  className={cn(
                    "inline-flex items-center gap-2",
                    "px-4 py-2.5",
                    "border border-[var(--border)]",
                    "text-[var(--foreground)]",
                    "font-mono text-sm uppercase tracking-wider",
                    "clip-notch",
                    "hover:bg-[var(--muted)] transition-colors",
                  )}
                >
                  {secondaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={secondaryAction.onClick}
                  className={cn(
                    "inline-flex items-center gap-2",
                    "px-4 py-2.5",
                    "border border-[var(--border)]",
                    "text-[var(--foreground)]",
                    "font-mono text-sm uppercase tracking-wider",
                    "clip-notch",
                    "hover:bg-[var(--muted)] transition-colors",
                  )}
                >
                  {secondaryAction.label}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
