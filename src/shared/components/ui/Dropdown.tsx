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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
            "absolute z-dropdown mt-2 min-w-[200px]",
            "notch-border animate-fade-in",
            "[--notch-border-color:theme(colors.gray.800)]",
            "[--notch-bg:theme(colors.gray.900)]",
            align === "left" ? "left-0" : "right-0",
          )}
        >
          <div className="notch-border-inner !block">
            {/* Bracket decoration */}
            <div className="absolute -top-px -left-px w-3 h-3 border-l border-t border-gray-700" />
            <div className="absolute -bottom-px -right-px w-3 h-3 border-r border-b border-gray-700" />

            <div className="py-1">
              {items.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleSelect(item)}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5",
                    "text-sm text-left",
                    "transition-colors duration-fast",
                    // Default state
                    "text-gray-300 hover:bg-gray-800 hover:text-white",
                    // Disabled
                    item.disabled &&
                      "opacity-40 cursor-not-allowed hover:bg-transparent",
                    // Destructive
                    item.destructive &&
                      "text-red-400 hover:text-red-300 hover:bg-red-500/10",
                    // Selected
                    selectedValue === item.value &&
                      "text-lime-400 bg-lime-400/10",
                  )}
                >
                  {item.icon && (
                    <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
                  )}
                  <span className="flex-1 font-mono text-label uppercase tracking-wider">
                    {item.label}
                  </span>
                  {selectedValue === item.value && (
                    <Check className="w-4 h-4 text-lime-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
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
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  // Notch border colors for variants
  const borderColors = {
    primary: "[--notch-border-color:white]",
    secondary: "[--notch-border-color:theme(colors.gray.700)]",
    outline:
      "[--notch-border-color:theme(colors.gray.700)] hover:[--notch-border-color:theme(colors.lime.400)]",
  };

  const bgColorsMap = {
    primary: "[--notch-bg:white]",
    secondary: "[--notch-bg:theme(colors.gray.800)]",
    outline: "[--notch-bg:transparent]",
  };

  const textColorsMap = {
    primary: "text-black",
    secondary: "text-white",
    outline: "text-white hover:text-lime-400",
  };

  const trigger = (
    <div
      className={cn(
        "notch-border-sm inline-flex",
        "transition-all duration-fast",
        borderColors[variant],
        bgColorsMap[variant],
      )}
    >
      <span
        className={cn(
          "notch-border-sm-inner",
          "inline-flex items-center gap-2",
          "font-mono uppercase tracking-wider",
          textColorsMap[variant],
          sizes[size],
        )}
      >
        {label}
        <ChevronDown className="w-4 h-4" />
      </span>
    </div>
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
