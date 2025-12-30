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
    ref
  ) => {
    const variants = {
      info: {
        container: "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]",
        icon: <Info className="w-5 h-5 text-[var(--primary)]" />,
      },
      success: {
        container: "bg-green-500/10 border-green-500/30 text-green-400",
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      },
      warning: {
        container: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      },
      error: {
        container: "bg-red-500/10 border-red-500/30 text-red-400",
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      },
    };

    const { container, icon } = variants[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex gap-3 p-4 border rounded-lg",
          container,
          className
        )}
        {...props}
      >
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="font-medium mb-1">{title}</h5>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };
