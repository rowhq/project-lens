"use client";

import { Modal } from "./Modal";
import { AlertTriangle, Trash2, Info, CheckCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type ConfirmationVariant = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
}

const variantConfig: Record<
  ConfirmationVariant,
  {
    icon: typeof AlertTriangle;
    iconColor: string;
    buttonColor: string;
    buttonHover: string;
  }
> = {
  danger: {
    icon: Trash2,
    iconColor: "text-red-500",
    buttonColor: "bg-red-600",
    buttonHover: "hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    buttonColor: "bg-amber-600",
    buttonHover: "hover:bg-amber-700",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    buttonColor: "bg-blue-600",
    buttonHover: "hover:bg-blue-700",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-500",
    buttonColor: "bg-green-600",
    buttonHover: "hover:bg-green-700",
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-4",
            variant === "danger" && "bg-red-500/10",
            variant === "warning" && "bg-amber-500/10",
            variant === "info" && "bg-blue-500/10",
            variant === "success" && "bg-green-500/10",
          )}
        >
          <Icon className={cn("w-6 h-6", config.iconColor)} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-[var(--muted-foreground)] mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={cn(
              "flex-1 px-4 py-2.5",
              "border border-[var(--border)]",
              "text-[var(--foreground)]",
              "hover:bg-[var(--muted)]",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 px-4 py-2.5",
              "text-white font-medium",
              config.buttonColor,
              config.buttonHover,
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2",
            )}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
