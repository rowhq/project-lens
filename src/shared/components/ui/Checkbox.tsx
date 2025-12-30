"use client";

import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2)}`;

    return (
      <div className={cn("relative flex items-start", className)}>
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              aria-invalid={error ? "true" : "false"}
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 border-2 rounded transition-colors cursor-pointer",
                "border-neutral-300 bg-white",
                "peer-checked:bg-brand-500 peer-checked:border-brand-500",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                error && "border-red-500"
              )}
            >
              <Check
                className={cn(
                  "w-full h-full text-white p-0.5 opacity-0 transition-opacity",
                  "peer-checked:opacity-100"
                )}
              />
            </div>
          </div>
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-neutral-700 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-neutral-500">{description}</p>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
