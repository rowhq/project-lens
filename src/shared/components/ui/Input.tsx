"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = "text",
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-mono text-gray-400 mb-2 uppercase">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-400 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              // Base styles
              "w-full px-4 py-3",
              "bg-gray-900 text-white",
              "border border-gray-700",
              "placeholder-gray-500",
              // Angular design
              "clip-notch-sm",
              // Focus state
              "focus:outline-none focus:border-lime-400",
              "focus:ring-1 focus:ring-lime-400/20",
              // Transition with Ledger easing
              "transition-all duration-300",
              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              // Error state
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-400 transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-caption text-red-500 font-mono">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-caption text-gray-500">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
