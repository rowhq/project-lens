"use client";

import { forwardRef } from "react";
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
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-mono text-gray-400 mb-2 uppercase">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              // Base styles
              "w-full px-4 py-3 pr-10",
              "bg-gray-900 text-white",
              "border border-gray-700",
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
              <option value="" disabled className="text-gray-500">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-gray-900 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-lime-400 pointer-events-none transition-colors" />
        </div>
        {error && (
          <p className="mt-2 text-caption text-red-500 font-mono">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
