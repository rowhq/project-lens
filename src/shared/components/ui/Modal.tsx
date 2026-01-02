"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { LedgerCorners } from "./Decorations";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-modal">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            // Base styles
            "relative w-full",
            "bg-gray-900 border border-gray-800",
            // Animation
            "animate-scale-in",
            // Size
            sizes[size],
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* L-bracket corner decorations */}
          <LedgerCorners color="lime" size="md" />

          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-4 border-b border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title && (
                    <h2 className="text-heading-md font-semibold text-white">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-body-sm text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    "p-2 -mr-2 -mt-1",
                    "text-gray-500 hover:text-white",
                    "hover:bg-gray-800",
                    "transition-colors duration-300",
                  )}
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { Modal };
