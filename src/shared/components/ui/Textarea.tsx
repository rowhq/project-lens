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

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-mono text-gray-400 mb-2 uppercase"
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
            "bg-gray-900 text-white",
            "border border-gray-700",
            "placeholder-gray-500",
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
            "disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed",
            // Error state
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-2 text-caption text-red-500 font-mono"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-caption text-gray-500">{hint}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
