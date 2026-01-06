"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LedgerCorners } from "./Decorations";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "lime";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  withBrackets?: boolean;
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
    // For outline variant, we use notch-border wrapper technique
    // The button background IS the border, inner span has the actual background
    const isOutline = variant === "outline";

    const variants = {
      primary: cn(
        "bg-[var(--foreground)] text-[var(--background)]",
        "hover:bg-lime-500 hover:text-gray-900",
        "focus:ring-[var(--foreground)]/30",
      ),
      secondary: cn(
        "bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        "hover:bg-[var(--muted)]",
        "focus:ring-[var(--muted-foreground)]/30",
      ),
      // Outline uses notch-border technique - background IS the border color
      outline: cn(
        "text-[var(--foreground)]",
        "hover:text-gray-900",
        "focus:ring-lime-500/30",
        // Border color as background (shows through as border)
        "[--notch-border-color:var(--border)]",
        "hover:[--notch-border-color:theme(colors.lime.500)]",
        // Inner background
        "[--notch-bg:var(--background)]",
        "hover:[--notch-bg:theme(colors.lime.500)]",
      ),
      ghost: cn(
        "bg-transparent text-[var(--muted-foreground)]",
        "hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50",
        "focus:ring-[var(--muted-foreground)]/30",
      ),
      danger: cn(
        "bg-red-600 text-white",
        "hover:bg-red-700",
        "focus:ring-red-500/30",
      ),
      lime: cn(
        "bg-lime-500 text-gray-900",
        "hover:bg-lime-400",
        "focus:ring-lime-500/30",
      ),
    };

    // Sizes with clip-notch classes
    // For outline, we use notch-border instead of clip-notch
    const sizes = {
      sm: isOutline
        ? "h-8 px-4 text-xs notch-border-sm"
        : "h-8 px-4 text-xs clip-notch-sm",
      md: isOutline
        ? "h-12 px-5 text-sm notch-border-sm"
        : "h-12 px-5 text-sm clip-notch",
      lg: isOutline
        ? "h-14 px-6 text-base notch-border"
        : "h-14 px-6 text-base clip-notch",
    };

    // Inner span classes for outline variant (the actual background)
    const innerClasses = {
      sm: "notch-border-sm-inner",
      md: "notch-border-sm-inner",
      lg: "notch-border-inner",
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

        {/* For outline variant, use inner span with background */}
        {isOutline ? (
          <span
            className={cn(innerClasses[size], "transition-all duration-300")}
          >
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
          </span>
        ) : (
          /* Standard content for non-outline variants */
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
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
