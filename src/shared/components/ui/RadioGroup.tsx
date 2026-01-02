"use client";

import { createContext, useContext } from "react";
import { cn } from "@/shared/lib/utils";

// RadioGroup Context
interface RadioGroupContextValue {
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroupItem must be used within a RadioGroup");
  }
  return context;
}

// RadioGroup
interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function RadioGroup({
  value,
  onChange,
  name,
  children,
  disabled,
  className,
  orientation = "vertical",
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange, name, disabled }}>
      <div
        role="radiogroup"
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row gap-4" : "flex-col gap-2",
          className,
        )}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

// RadioGroupItem - Ledger Style
interface RadioGroupItemProps {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function RadioGroupItem({
  value,
  label,
  description,
  disabled: itemDisabled,
  className,
}: RadioGroupItemProps) {
  const {
    value: groupValue,
    onChange,
    name,
    disabled: groupDisabled,
  } = useRadioGroup();
  const isChecked = groupValue === value;
  const isDisabled = itemDisabled || groupDisabled;

  return (
    <label
      className={cn(
        "flex items-start gap-3 cursor-pointer",
        isDisabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="radio"
          name={name}
          value={value}
          checked={isChecked}
          onChange={() => onChange(value)}
          disabled={isDisabled}
          className="sr-only"
        />
        <div
          className={cn(
            "w-5 h-5 border transition-all clip-notch-sm",
            isChecked
              ? "border-lime-500 bg-lime-500"
              : "border-gray-700 bg-gray-900",
            !isDisabled && "hover:border-gray-600",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        >
          {isChecked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-2 h-2 bg-black"
                style={{
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

// Card-style RadioGroup - Ledger Style
interface RadioCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function RadioCard({
  value,
  label,
  description,
  icon,
  disabled: itemDisabled,
  className,
}: RadioCardProps) {
  const {
    value: groupValue,
    onChange,
    name,
    disabled: groupDisabled,
  } = useRadioGroup();
  const isChecked = groupValue === value;
  const isDisabled = itemDisabled || groupDisabled;

  return (
    <label
      className={cn(
        "relative flex items-start gap-4 p-4 border cursor-pointer transition-all clip-notch",
        isChecked
          ? "border-lime-500 bg-lime-500/10"
          : "border-gray-800 hover:border-gray-700 bg-gray-900",
        isDisabled && "cursor-not-allowed opacity-50",
        className,
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
    >
      {/* L-bracket corners when checked */}
      {isChecked && (
        <>
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-400 pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-400 pointer-events-none" />
        </>
      )}
      <input
        type="radio"
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onChange(value)}
        disabled={isDisabled}
        className="sr-only"
      />
      {icon && (
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 flex items-center justify-center clip-notch-sm border",
            isChecked
              ? "bg-lime-500/20 text-lime-400 border-lime-500/30"
              : "bg-gray-800 text-gray-400 border-gray-700",
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={cn(
          "flex-shrink-0 w-5 h-5 border transition-all clip-notch-sm",
          isChecked
            ? "border-lime-500 bg-lime-500"
            : "border-gray-700 bg-gray-900",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
      >
        {isChecked && (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-2 h-2 bg-black"
              style={{
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
          </div>
        )}
      </div>
    </label>
  );
}
