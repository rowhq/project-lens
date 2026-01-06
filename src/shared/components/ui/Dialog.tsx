"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative bg-gray-900 text-white shadow-[inset_0_0_0_1px_theme(colors.gray.800)] max-w-lg w-full max-h-[90vh] overflow-auto animate-scale-in clip-notch",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* L-bracket corners */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-lime-400 pointer-events-none z-10" />
          <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-lime-400 pointer-events-none z-10" />
          <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-lime-400 pointer-events-none z-10" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-lime-400 pointer-events-none z-10" />
          {children}
        </div>
      </div>
    </div>
  );
}

// Dialog Header
interface DialogHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function DialogHeader({
  children,
  onClose,
  className,
}: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 border-b border-gray-800",
        className,
      )}
    >
      <div className="font-semibold text-lg text-white">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 -m-2 text-gray-400 hover:text-white transition-colors clip-notch-sm hover:bg-gray-800"
          style={{ transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)" }}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Dialog Body
interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogBody({ children, className }: DialogBodyProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

// Dialog Footer
interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-gray-950",
        className,
      )}
    >
      {children}
    </div>
  );
}
