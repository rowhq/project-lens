"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/shared/lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// Tabs Root
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = value ?? internalValue;

  const setActiveTab = (tab: string) => {
    if (value === undefined) {
      setInternalValue(tab);
    }
    onValueChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// Tabs List - Underline style (Ledger)
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-0",
        "border-b border-gray-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Tab Trigger - Underline indicator
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
  icon,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        // Base styles
        "relative px-4 py-3",
        "text-sm font-mono uppercase tracking-wider",
        "transition-all duration-300",
        // States
        isActive ? "text-lime-400" : "text-gray-500 hover:text-white",
        // Disabled
        disabled && "opacity-40 cursor-not-allowed",
        // Focus
        "focus:outline-none focus-visible:text-lime-400",
        className,
      )}
      style={{
        transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
      }}
    >
      <span className="flex items-center gap-2">
        {icon && <span className="w-4 h-4">{icon}</span>}
        {children}
      </span>
      {/* Active indicator line */}
      <span
        className={cn(
          "absolute bottom-0 left-0 right-0 h-px",
          "transition-all duration-normal ease-ledger",
          isActive ? "bg-lime-400" : "bg-transparent",
        )}
      />
    </button>
  );
}

// Tab Content
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabs();

  if (activeTab !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      tabIndex={0}
      className={cn("mt-6 animate-fade-in focus:outline-none", className)}
    >
      {children}
    </div>
  );
}
