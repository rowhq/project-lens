"use client";

import { forwardRef, useId } from "react";
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
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = error ? `${id}-error` : undefined;
    const hintId = hint && !error ? `${id}-hint` : undefined;
    const describedBy =
      [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-mono text-[var(--muted-foreground)] mb-2 uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-lime-400 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            className={cn(
              // Base styles
              "w-full px-4 py-3",
              "bg-[var(--input)] text-[var(--foreground)]",
              "border border-[var(--border)]",
              "placeholder-[var(--muted-foreground)]",
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-lime-400 transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-2 text-caption text-red-500 font-mono"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={hintId}
            className="mt-2 text-caption text-[var(--muted-foreground)]"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
