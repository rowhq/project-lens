/**
 * Shared Search Input Component
 * Responsive search bar used in headers
 */

"use client";

import { Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  responsive?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchInput({
  placeholder = "Search...",
  responsive = true,
  className,
  value,
  onChange,
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "relative",
        responsive ? "hidden flex-1 lg:block lg:max-w-md" : "flex-1 max-w-lg",
        className
      )}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
    </div>
  );
}
