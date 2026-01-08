"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** Controlled value */
  value?: string;
  /** Change handler - receives the string value directly */
  onChange?: (value: string) => void;
  /** Debounce delay in ms (0 = no debounce) */
  debounceMs?: number;
  /** Show clear button when input has value */
  showClear?: boolean;
  /** Show keyboard shortcut hint */
  showShortcut?: boolean;
  /** Custom shortcut key to display */
  shortcutKey?: string;
  /** Full width styling */
  fullWidth?: boolean;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      debounceMs = 0,
      showClear = true,
      showShortcut = false,
      shortcutKey = "/",
      fullWidth = true,
      className,
      placeholder = "Search...",
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(controlledValue ?? "");
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;
    const debouncedValueRef = useRef(currentValue);

    // Debounced onChange - uses ref to avoid effect dependency issues
    useEffect(() => {
      if (debounceMs === 0 || !onChange) return;
      if (debouncedValueRef.current === currentValue) return;

      const timer = setTimeout(() => {
        debouncedValueRef.current = currentValue;
        onChange(currentValue);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [currentValue, debounceMs, onChange]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);

        // If no debounce, call onChange immediately
        if (debounceMs === 0 && onChange) {
          onChange(newValue);
        }
      },
      [debounceMs, onChange],
    );

    const handleClear = useCallback(() => {
      setInternalValue("");
      if (onChange) {
        onChange("");
      }
    }, [onChange]);

    // Keyboard shortcut to focus
    useEffect(() => {
      if (!showShortcut) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === shortcutKey &&
          !["INPUT", "TEXTAREA", "SELECT"].includes(
            (e.target as HTMLElement).tagName,
          )
        ) {
          e.preventDefault();
          const input = document.querySelector<HTMLInputElement>(
            '[data-search-input="true"]',
          );
          input?.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [showShortcut, shortcutKey]);

    return (
      <div className={cn("relative group", fullWidth && "flex-1", className)}>
        {/* Search icon */}
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)] group-focus-within:text-lime-400 transition-colors pointer-events-none"
          aria-hidden="true"
        />

        {/* Input */}
        <input
          ref={ref}
          type="text"
          role="searchbox"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          data-search-input="true"
          className={cn(
            // Base styles
            "w-full pl-12 py-3",
            "bg-[var(--card)] text-[var(--foreground)]",
            "border border-[var(--border)]",
            "placeholder-[var(--muted-foreground)]",
            // Angular design
            "clip-notch",
            // Focus state
            "focus:outline-none focus:border-lime-400/50",
            // Transition
            "transition-colors duration-300",
            // Right padding for clear/shortcut
            showClear && currentValue
              ? "pr-10"
              : showShortcut
                ? "pr-14"
                : "pr-4",
          )}
          {...props}
        />

        {/* Clear button */}
        {showClear && currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Keyboard shortcut hint */}
        {showShortcut && !currentValue && (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs font-mono text-[var(--muted-foreground)] bg-[var(--muted)] border border-[var(--border)] rounded">
            {shortcutKey}
          </kbd>
        )}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
