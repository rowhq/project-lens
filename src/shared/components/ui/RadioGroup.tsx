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
          className
        )}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

// RadioGroupItem
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
  const { value: groupValue, onChange, name, disabled: groupDisabled } = useRadioGroup();
  const isChecked = groupValue === value;
  const isDisabled = itemDisabled || groupDisabled;

  return (
    <label
      className={cn(
        "flex items-start gap-3 cursor-pointer",
        isDisabled && "cursor-not-allowed opacity-50",
        className
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
            "w-5 h-5 rounded-full border-2 transition-colors",
            isChecked
              ? "border-brand-500 bg-brand-500"
              : "border-neutral-300 bg-white",
            !isDisabled && "hover:border-brand-400"
          )}
        >
          {isChecked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        {description && (
          <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

// Card-style RadioGroup
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
  const { value: groupValue, onChange, name, disabled: groupDisabled } = useRadioGroup();
  const isChecked = groupValue === value;
  const isDisabled = itemDisabled || groupDisabled;

  return (
    <label
      className={cn(
        "relative flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all",
        isChecked
          ? "border-brand-500 bg-brand-50"
          : "border-neutral-200 hover:border-neutral-300",
        isDisabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
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
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            isChecked ? "bg-brand-100 text-brand-600" : "bg-neutral-100 text-neutral-600"
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-neutral-900">{label}</span>
        {description && (
          <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
      <div
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors",
          isChecked ? "border-brand-500 bg-brand-500" : "border-neutral-300"
        )}
      >
        {isChecked && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
        )}
      </div>
    </label>
  );
}
