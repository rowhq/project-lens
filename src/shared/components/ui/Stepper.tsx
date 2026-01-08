"use client";

import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StepperStep<T extends string = string> {
  /** Unique identifier for the step */
  id: T;
  /** Display label */
  label: string;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Optional description */
  description?: string;
}

export interface StepperProps<T extends string = string> {
  /** Array of steps */
  steps: StepperStep<T>[];
  /** Current active step ID */
  currentStep: T;
  /** Callback when step is clicked (optional - for clickable steps) */
  onStepClick?: (stepId: T) => void;
  /** Allow clicking on completed steps to go back */
  allowNavigation?: boolean;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md";
  /** Additional class names */
  className?: string;
}

function Stepper<T extends string = string>({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
  orientation = "horizontal",
  size = "md",
  className,
}: StepperProps<T>) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const sizeConfig = {
    sm: {
      icon: "w-4 h-4",
      text: "text-xs",
      padding: "px-3 py-1.5",
      connector: "w-8",
    },
    md: {
      icon: "w-5 h-5",
      text: "text-sm",
      padding: "px-4 py-2",
      connector: "w-12",
    },
  };

  const config = sizeConfig[size];

  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col", className)}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;
          const isClickable = allowNavigation && isCompleted && onStepClick;

          return (
            <div key={step.id} className="flex">
              {/* Step indicator column */}
              <div className="flex flex-col items-center mr-4">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 clip-notch-sm transition-colors",
                    isActive && "bg-lime-400 text-black",
                    isCompleted &&
                      "bg-lime-400/10 text-lime-400 border border-lime-400/30",
                    !isActive &&
                      !isCompleted &&
                      "bg-[var(--muted)] text-[var(--muted-foreground)]",
                    isClickable && "cursor-pointer hover:opacity-80",
                    !isClickable && "cursor-default",
                  )}
                >
                  {isCompleted ? (
                    <Check className={config.icon} />
                  ) : Icon ? (
                    <Icon className={config.icon} />
                  ) : (
                    <span className="font-mono font-bold">{index + 1}</span>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-8 bg-[var(--border)] my-2" />
                )}
              </div>

              {/* Step content column */}
              <div className="pb-8">
                <p
                  className={cn(
                    "font-mono uppercase tracking-wider font-medium mt-2",
                    config.text,
                    isActive && "text-[var(--foreground)]",
                    isCompleted && "text-lime-400",
                    !isActive &&
                      !isCompleted &&
                      "text-[var(--muted-foreground)]",
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation (default)
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = index < currentStepIndex;
        const isClickable = allowNavigation && isCompleted && onStepClick;

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 font-mono uppercase tracking-wider clip-notch-sm transition-colors",
                config.padding,
                config.text,
                isActive && "bg-lime-400 text-black",
                isCompleted &&
                  "bg-lime-400/10 text-lime-400 border border-lime-400/30",
                !isActive &&
                  !isCompleted &&
                  "bg-[var(--muted)] text-[var(--muted-foreground)]",
                isClickable && "cursor-pointer hover:opacity-80",
                !isClickable && "cursor-default",
              )}
            >
              {isCompleted ? (
                <Check className={config.icon} />
              ) : Icon ? (
                <Icon className={config.icon} />
              ) : (
                <span className="font-bold">{index + 1}</span>
              )}
              <span className="font-medium">{step.label}</span>
            </button>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 bg-[var(--border)] mx-2",
                  config.connector,
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { Stepper };
