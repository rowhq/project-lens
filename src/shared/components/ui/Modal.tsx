"use client";

import { useEffect, useCallback, useRef } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  // Focus trap - keep focus within modal
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTabKey);
      document.body.style.overflow = "hidden";

      // Focus the modal container
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTabKey);
      document.body.style.overflow = "unset";

      // Return focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscape, handleTabKey]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  const titleId = title ? "modal-title" : undefined;
  const descriptionId = description ? "modal-description" : undefined;

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
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          className={cn(
            // Base styles
            "relative w-full",
            "bg-[var(--card)] border border-[var(--border)]",
            // Animation
            "animate-scale-in",
            // Focus outline
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50",
            // Size
            sizes[size],
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* L-bracket corner decorations */}
          <LedgerCorners color="lime" size="md" />

          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title && (
                    <h2
                      id={titleId}
                      className="text-heading-md font-semibold text-[var(--foreground)]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-body-sm text-[var(--muted-foreground)]"
                    >
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className={cn(
                    "p-2 -mr-2 -mt-1",
                    "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    "hover:bg-[var(--muted)]",
                    "transition-colors duration-300 ease-ledger",
                  )}
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
            <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compound components for flexible usage
interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 border-b border-[var(--border)]",
        className,
      )}
    >
      <div className="font-semibold text-lg text-[var(--foreground)]">
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 -m-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn("px-6 py-6", className)}>{children}</div>;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Modal, ModalHeader, ModalBody, ModalFooter };
