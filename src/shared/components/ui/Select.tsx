"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder,
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
          <select
            ref={ref}
            id={id}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            className={cn(
              // Base styles
              "w-full px-4 py-3 pr-10",
              "bg-[var(--input)] text-[var(--foreground)]",
              "border border-[var(--border)]",
              "appearance-none cursor-pointer",
              // Angular design
              "clip-notch-sm",
              // Focus state
              "focus:outline-none focus:border-lime-400",
              "focus:ring-1 focus:ring-lime-400/20",
              // Transition with Ledger easing
              "transition-all duration-300",
              // Error state
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option
                value=""
                disabled
                className="text-[var(--muted-foreground)]"
              >
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-[var(--input)] text-[var(--foreground)]"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-lime-400 pointer-events-none transition-colors" />
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

Select.displayName = "Select";

export { Select };
