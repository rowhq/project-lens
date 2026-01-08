"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  label,
  error,
  hint,
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const handleToggleOpen = useCallback(() => {
    if (disabled) return;
    if (!isOpen && value) {
      // When opening, sync viewDate to current value
      setViewDate(value);
    }
    setIsOpen(!isOpen);
  }, [disabled, isOpen, value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateSelect = (date: Date) => {
    onChange?.(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-2"
        >
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        onClick={handleToggleOpen}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3",
          "border clip-notch-sm bg-[var(--card)] text-sm font-mono",
          "focus:outline-none focus:border-lime-400/50 transition-colors",
          error
            ? "border-red-500"
            : isOpen
              ? "border-lime-400/50"
              : "border-[var(--border)]",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-[var(--muted-foreground)]",
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
          <span
            className={value ? "text-white" : "text-[var(--muted-foreground)]"}
          >
            {value ? formatDate(value) : placeholder}
          </span>
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-[var(--secondary)] rounded"
            aria-label="Clear date"
          >
            <X className="w-3 h-3 text-[var(--muted-foreground)]" />
          </button>
        )}
      </button>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {hint && !error && (
        <p className="text-[var(--muted-foreground)] text-sm mt-1">{hint}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-[var(--card)] border border-[var(--border)] clip-notch shadow-xl w-72">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-[var(--secondary)] rounded"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
            </button>
            <span className="font-mono text-sm text-white">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-[var(--secondary)] rounded"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 p-2 border-b border-[var(--border)]">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-mono text-[var(--muted-foreground)] py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map(({ date, isCurrentMonth }, index) => {
              const disabled = isDateDisabled(date);
              const selected = isSelected(date);
              const today = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !disabled && handleDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    "w-8 h-8 text-sm font-mono rounded transition-colors",
                    !isCurrentMonth && "text-[var(--muted-foreground)]/50",
                    isCurrentMonth && !selected && "text-white",
                    selected && "bg-lime-400 text-black",
                    !selected && today && "border border-lime-400/50",
                    !selected && !disabled && "hover:bg-[var(--secondary)]",
                    disabled && "opacity-30 cursor-not-allowed",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between p-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                handleDateSelect(today);
              }}
              className="text-xs font-mono text-lime-400 hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-mono text-[var(--muted-foreground)] hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
