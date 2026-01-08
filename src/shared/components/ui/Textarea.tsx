"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/shared/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const hintId = hint && !error ? `${textareaId}-hint` : undefined;
    const describedBy =
      [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-mono text-[var(--muted-foreground)] mb-2 uppercase"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
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
            // Transition
            "transition-all duration-fast",
            // Resize
            "resize-y min-h-[120px]",
            // Disabled
            "disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)] disabled:cursor-not-allowed",
            // Error state
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...props}
        />
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

Textarea.displayName = "Textarea";

export { Textarea };
