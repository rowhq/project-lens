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
            "w-5 h-5 notch-border-sm transition-all",
            isChecked
              ? "[--notch-border-color:theme(colors.lime.500)] [--notch-bg:theme(colors.lime.500)]"
              : "[--notch-border-color:theme(colors.gray.700)] [--notch-bg:theme(colors.gray.900)]",
            !isDisabled &&
              "hover:[--notch-border-color:theme(colors.gray.600)]",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
        >
          <span className="notch-border-sm-inner">
            {isChecked && (
              <div
                className="w-2 h-2 bg-black"
                style={{
                  clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                }}
              />
            )}
          </span>
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
    <div
      className={cn(
        "notch-border cursor-pointer transition-all",
        isChecked
          ? "[--notch-border-color:theme(colors.lime.500)] [--notch-bg:theme(colors.lime.500/0.1)]"
          : "[--notch-border-color:theme(colors.gray.800)] [--notch-bg:theme(colors.gray.900)] hover:[--notch-border-color:theme(colors.gray.700)]",
        isDisabled && "cursor-not-allowed opacity-50",
        className,
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
    >
      <label className="notch-border-inner !block relative p-4">
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
        <div className="flex items-start gap-4">
          {icon && (
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 notch-border-sm",
                isChecked
                  ? "[--notch-bg:theme(colors.lime.500/0.2)] [--notch-border-color:theme(colors.lime.500/0.3)]"
                  : "[--notch-bg:theme(colors.gray.800)] [--notch-border-color:theme(colors.gray.700)]",
              )}
            >
              <span
                className={cn(
                  "notch-border-sm-inner",
                  isChecked ? "text-lime-400" : "text-gray-400",
                )}
              >
                {icon}
              </span>
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
              "flex-shrink-0 w-5 h-5 notch-border-sm transition-all",
              isChecked
                ? "[--notch-border-color:theme(colors.lime.500)] [--notch-bg:theme(colors.lime.500)]"
                : "[--notch-border-color:theme(colors.gray.700)] [--notch-bg:theme(colors.gray.900)]",
            )}
            style={{
              transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
            }}
          >
            <span className="notch-border-sm-inner">
              {isChecked && (
                <div
                  className="w-2 h-2 bg-black"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  }}
                />
              )}
            </span>
          </div>
        </div>
      </label>
    </div>
  );
}
