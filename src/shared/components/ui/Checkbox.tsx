"use client";

import { forwardRef, useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

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
            {/* Notch border wrapper */}
            <div
              className={cn(
                "w-5 h-5 notch-border-sm transition-all cursor-pointer",
                "[--notch-border-color:theme(colors.gray.700)]",
                "[--notch-bg:theme(colors.gray.900)]",
                "peer-checked:[--notch-border-color:theme(colors.lime.500)]",
                "peer-checked:[--notch-bg:theme(colors.lime.500)]",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-lime-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-gray-950",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                "hover:[--notch-border-color:theme(colors.gray.600)]",
                error && "[--notch-border-color:theme(colors.red.500)]",
              )}
              style={{
                transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
              }}
            >
              <span className="notch-border-sm-inner">
                <Check
                  className={cn(
                    "w-full h-full text-black p-0.5 opacity-0 transition-opacity",
                    "peer-checked:opacity-100",
                  )}
                />
              </span>
            </div>
          </div>
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-white cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-400">{description}</p>
            )}
            {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
