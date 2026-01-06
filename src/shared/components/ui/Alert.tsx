"use client";

import { forwardRef } from "react";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "info",
      title,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      info: {
        container: "bg-blue-500/5 border-blue-500/20 text-blue-400",
        icon: <Info className="w-5 h-5" />,
        iconColor: "text-blue-400",
      },
      success: {
        container: "bg-lime-400/5 border-lime-400/20 text-lime-400",
        icon: <CheckCircle className="w-5 h-5" />,
        iconColor: "text-lime-400",
      },
      warning: {
        container: "bg-yellow-500/5 border-yellow-500/20 text-yellow-400",
        icon: <AlertCircle className="w-5 h-5" />,
        iconColor: "text-yellow-400",
      },
      error: {
        container: "bg-red-500/5 border-red-500/20 text-red-400",
        icon: <XCircle className="w-5 h-5" />,
        iconColor: "text-red-400",
      },
    };

    const { icon, iconColor } = variants[variant];

    // Border colors for notch-border wrapper
    const borderColors = {
      info: "[--notch-border-color:theme(colors.blue.500/0.2)]",
      success: "[--notch-border-color:theme(colors.lime.400/0.2)]",
      warning: "[--notch-border-color:theme(colors.yellow.500/0.2)]",
      error: "[--notch-border-color:theme(colors.red.500/0.2)]",
    };

    // Background colors for inner
    const bgColors = {
      info: "[--notch-bg:theme(colors.blue.500/0.05)]",
      success: "[--notch-bg:theme(colors.lime.400/0.05)]",
      warning: "[--notch-bg:theme(colors.yellow.500/0.05)]",
      error: "[--notch-bg:theme(colors.red.500/0.05)]",
    };

    // Text colors
    const textColors = {
      info: "text-blue-400",
      success: "text-lime-400",
      warning: "text-yellow-400",
      error: "text-red-400",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "notch-border",
          borderColors[variant],
          bgColors[variant],
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "notch-border-inner !justify-start",
            "relative flex gap-3 p-4",
            textColors[variant],
          )}
        >
          {/* Bracket decoration */}
          <div
            className={cn(
              "absolute -top-px -left-px w-2 h-2 border-l border-t",
              iconColor.replace("text-", "border-"),
            )}
          />
          <div
            className={cn(
              "absolute -bottom-px -right-px w-2 h-2 border-r border-b",
              iconColor.replace("text-", "border-"),
            )}
          />

          <div className={cn("flex-shrink-0", iconColor)}>{icon}</div>
          <div className="flex-1 min-w-0">
            {title && <h5 className="font-medium text-white mb-1">{title}</h5>}
            <div className="text-body-sm opacity-90">{children}</div>
          </div>
          {dismissible && (
            <button
              onClick={onDismiss}
              className={cn(
                "flex-shrink-0 p-1",
                "text-current opacity-60 hover:opacity-100",
                "clip-notch-sm",
                "transition-opacity duration-fast",
              )}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";

export { Alert };
