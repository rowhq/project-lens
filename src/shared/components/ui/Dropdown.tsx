"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  selectedValue,
  align = "left",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;
    onSelect(item.value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-dropdown mt-1 min-w-[180px] py-1 bg-white border border-neutral-200 rounded-lg shadow-lg animate-fade-in",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleSelect(item)}
              disabled={item.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors",
                "hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none",
                item.disabled && "opacity-50 cursor-not-allowed",
                item.destructive && "text-red-600 hover:bg-red-50",
                selectedValue === item.value && "bg-brand-50 text-brand-600"
              )}
            >
              {item.icon && (
                <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
              )}
              <span className="flex-1">{item.label}</span>
              {selectedValue === item.value && (
                <Check className="w-4 h-4 text-brand-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Dropdown Button
interface DropdownButtonProps {
  label: string;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DropdownButton({
  label,
  items,
  onSelect,
  selectedValue,
  variant = "outline",
  size = "md",
  className,
}: DropdownButtonProps) {
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600",
    secondary: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
    outline: "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const trigger = (
    <button
      className={cn(
        "inline-flex items-center gap-2 font-medium rounded-lg transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {label}
      <ChevronDown className="w-4 h-4" />
    </button>
  );

  return (
    <Dropdown
      trigger={trigger}
      items={items}
      onSelect={onSelect}
      selectedValue={selectedValue}
    />
  );
}
