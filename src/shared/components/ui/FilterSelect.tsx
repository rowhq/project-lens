"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FilterSelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  /** Options for the select */
  options: FilterOption[];
  /** Controlled value */
  value?: string;
  /** Change handler - receives the string value directly */
  onChange?: (value: string) => void;
  /** Minimum width */
  minWidth?: string;
  /** Show "All" option as first choice */
  showAllOption?: boolean;
  /** Label for the "All" option */
  allOptionLabel?: string;
  /** Icon to show before the chevron */
  icon?: React.ReactNode;
}

const FilterSelect = forwardRef<HTMLSelectElement, FilterSelectProps>(
  (
    {
      options,
      value,
      onChange,
      minWidth = "180px",
      showAllOption = false,
      allOptionLabel = "All",
      icon,
      className,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="relative" style={{ minWidth }}>
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          value={value}
          onChange={handleChange}
          className={cn(
            // Base styles
            "w-full py-3 pr-10",
            icon ? "pl-10" : "px-4",
            "bg-[var(--card)] text-[var(--foreground)]",
            "border border-[var(--border)]",
            "appearance-none cursor-pointer",
            // Angular design
            "clip-notch",
            // Focus state
            "focus:outline-none focus:border-lime-400/50",
            // Transition
            "transition-colors duration-300",
            className,
          )}
          {...props}
        >
          {showAllOption && (
            <option
              value=""
              className="bg-[var(--card)] text-[var(--foreground)]"
            >
              {allOptionLabel}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="bg-[var(--card)] text-[var(--foreground)]"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] pointer-events-none" />
      </div>
    );
  },
);

FilterSelect.displayName = "FilterSelect";

export { FilterSelect };
