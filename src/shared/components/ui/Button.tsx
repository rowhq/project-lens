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
    const variants = {
      primary: cn(
        "bg-white text-gray-900",
        "hover:bg-lime-400 hover:text-gray-900",
        "border border-white hover:border-lime-400",
        "focus:ring-white/30",
      ),
      secondary: cn(
        "bg-gray-900 text-white",
        "hover:bg-gray-800",
        "border border-gray-700 hover:border-gray-600",
        "focus:ring-gray-600/30",
      ),
      outline: cn(
        "bg-transparent text-white",
        "hover:bg-lime-400/10 hover:text-lime-400",
        "border border-gray-600 hover:border-lime-400",
        "focus:ring-lime-400/30",
      ),
      ghost: cn(
        "bg-transparent text-gray-300",
        "hover:text-white hover:bg-gray-800/50",
        "focus:ring-gray-600/30",
      ),
      danger: cn(
        "bg-red-600 text-white",
        "hover:bg-red-700",
        "border border-red-600 hover:border-red-700",
        "focus:ring-red-500/30",
      ),
      lime: cn(
        "bg-lime-400 text-gray-900",
        "hover:bg-lime-300",
        "border border-lime-400 hover:border-lime-300",
        "focus:ring-lime-400/30",
      ),
    };

    // Sizes: lg (56px/16px - standard), md (48px/14px), sm (32px/12px)
    // All buttons get clip-notch for Ledger style
    const sizes = {
      sm: "h-8 px-4 text-xs clip-notch-sm", // 32px height, 12px font
      md: "h-12 px-5 text-sm clip-notch", // 48px height, 14px font
      lg: "h-14 px-6 text-base clip-notch", // 56px height, 16px font (standard)
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
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950",
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
        {/* Optional L-bracket corners for outline variant */}
        {(withBrackets || variant === "outline") && (
          <LedgerCorners color="gray" size="sm" />
        )}

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
