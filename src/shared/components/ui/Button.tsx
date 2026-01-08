"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LedgerCorners } from "./Decorations";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "lime";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  withBrackets?: boolean;
  /** Required when using icon-only buttons (no children) for accessibility */
  "aria-label"?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "lg", // Default to lg (56px) as standard
      isLoading = false,
      leftIcon,
      rightIcon,
      withBrackets = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary: cn(
        "bg-[var(--foreground)] text-[var(--background)]",
        "hover:bg-lime-500 hover:!text-black",
        "border border-[var(--foreground)] hover:border-lime-500",
        "focus:ring-[var(--foreground)]/30",
      ),
      secondary: cn(
        "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        "hover:bg-[var(--muted)]",
        "border border-[var(--border)] hover:border-[var(--muted-foreground)]",
        "focus:ring-[var(--muted-foreground)]/30",
      ),
      outline: cn(
        "bg-transparent text-[var(--foreground)]",
        "hover:bg-lime-500 hover:!text-black",
        "border border-[var(--border)] hover:border-lime-500",
        "focus:ring-lime-500/30",
      ),
      ghost: cn(
        "bg-transparent text-[var(--muted-foreground)]",
        "hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50",
        "focus:ring-[var(--muted-foreground)]/30",
      ),
      danger: cn(
        "bg-red-600 text-white",
        "hover:bg-red-700",
        "border border-red-600 hover:border-red-700",
        "focus:ring-red-500/30",
      ),
      lime: cn(
        "bg-lime-500 !text-black",
        "hover:bg-lime-400",
        "border border-lime-500 hover:border-lime-400",
        "focus:ring-lime-500/30",
      ),
    };

    // Sizes: lg (56px/16px - standard), md (48px/14px), sm (32px/12px), icon (square)
    // All buttons get clip-notch for Ledger style
    const sizes = {
      sm: "h-8 px-4 text-xs clip-notch-sm", // 32px height, 12px font
      md: "h-12 px-5 text-sm clip-notch", // 48px height, 14px font
      lg: "h-14 px-6 text-base clip-notch", // 56px height, 16px font (standard)
      icon: "h-10 w-10 p-0 clip-notch-sm", // 40px square for icon-only buttons
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "group relative",
          "inline-flex items-center justify-center gap-2",
          "font-mono uppercase tracking-wider",
          // Transitions with Ledger easing
          "transition-all duration-300",
          // Focus state
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)]",
          // Disabled state
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          // Variant and size
          variants[variant],
          sizes[size],
          className,
        )}
        style={{
          transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
        }}
        {...props}
      >
        {/* Optional L-bracket corners - only when explicitly requested */}
        {withBrackets && <LedgerCorners color="gray" size="sm" />}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : leftIcon ? (
            <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
              {leftIcon}
            </span>
          ) : null}
          <span>{children}</span>
          {rightIcon && !isLoading && (
            <span className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
              {rightIcon}
            </span>
          )}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
