"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface AddressSuggestion {
  id: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
}

interface AddressInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (address: AddressSuggestion) => void;
  onSearch?: (query: string) => Promise<AddressSuggestion[]>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function AddressInput({
  value,
  onChange,
  onSelect,
  onSearch,
  placeholder = "Enter property address...",
  disabled,
  error,
  className,
}: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Debounced search
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchAddresses = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!query || query.length < 3 || !onSearch) {
        setSuggestions([]);
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await onSearch(query);
          setSuggestions(results);
        } catch (error) {
          console.error("Address search failed:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [onSearch]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);
    searchAddresses(newValue);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.address);
    onChange?.(suggestion.address);
    onSelect?.(suggestion);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange?.("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setSuggestions([]);
        setSelectedIndex(-1);
        break;
    }
  };

  const showSuggestions = isFocused && (suggestions.length > 0 || isLoading);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5 text-neutral-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-10 py-3 text-base border rounded-lg",
            "placeholder:text-neutral-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "disabled:bg-neutral-50 disabled:cursor-not-allowed",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-neutral-200"
          )}
          aria-invalid={error ? "true" : "false"}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          role="combobox"
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-dropdown w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-sm text-neutral-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching addresses...
            </li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(suggestion)}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors",
                  index === selectedIndex
                    ? "bg-brand-50 text-brand-700"
                    : "hover:bg-neutral-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{suggestion.street}</p>
                    <p className="text-xs text-neutral-500">
                      {suggestion.city}, {suggestion.state} {suggestion.zipCode}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
