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
            "bg-gray-900 shadow-[inset_0_0_0_1px_theme(colors.gray.800)]",
            "clip-notch",
            "animate-fade-in",
            align === "left" ? "left-0" : "right-0",
          )}
        >
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
    primary:
      "bg-white text-black shadow-[inset_0_0_0_1px_theme(colors.white)] hover:bg-gray-100",
    secondary:
      "bg-gray-800 text-white shadow-[inset_0_0_0_1px_theme(colors.gray.700)] hover:bg-gray-700",
    outline:
      "bg-transparent text-white shadow-[inset_0_0_0_1px_theme(colors.gray.700)] hover:shadow-[inset_0_0_0_1px_theme(colors.lime.400)] hover:text-lime-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  const trigger = (
    <button
      className={cn(
        "inline-flex items-center gap-2",
        "font-mono uppercase tracking-wider",
        "clip-notch-sm",
        "transition-all duration-fast",
        variants[variant],
        sizes[size],
        className,
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
