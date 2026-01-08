"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Toast Types
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { addToast } = context;

  const success = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "success", title, message }),
    [addToast],
  );

  const error = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "error", title, message }),
    [addToast],
  );

  const warning = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "warning", title, message }),
    [addToast],
  );

  const info = useCallback(
    (title: string, message?: string) =>
      addToast({ type: "info", title, message }),
    [addToast],
  );

  return { success, error, warning, info };
}

// Maximum toasts to show at once
const MAX_VISIBLE_TOASTS = 5;

// Toast Container
function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts } = context;

  // Only show the latest N toasts
  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);
  const hiddenCount = toasts.length - visibleToasts.length;

  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {hiddenCount > 0 && (
        <div className="text-xs text-[var(--muted-foreground)] text-right pr-2 pointer-events-none">
          +{hiddenCount} more
        </div>
      )}
      {visibleToasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          total={visibleToasts.length}
        />
      ))}
    </div>
  );
}

// Single Toast Item
function ToastItem({
  toast,
  index,
  total,
}: {
  toast: Toast;
  index: number;
  total: number;
}) {
  const context = useContext(ToastContext);
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      styles: "bg-gray-900 border-lime-400/30 text-lime-400",
      iconColor: "text-lime-400",
      borderAccent: "border-lime-400",
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      styles: "bg-gray-900 border-red-500/30 text-red-400",
      iconColor: "text-red-400",
      borderAccent: "border-red-500",
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      styles: "bg-gray-900 border-yellow-500/30 text-yellow-400",
      iconColor: "text-yellow-400",
      borderAccent: "border-yellow-500",
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      styles: "bg-gray-900 border-blue-500/30 text-blue-400",
      iconColor: "text-blue-400",
      borderAccent: "border-blue-500",
    },
  };

  const { icon, styles, iconColor, borderAccent } = config[toast.type];

  // Calculate scale for stacking effect (older toasts slightly smaller)
  const stackOffset = total - 1 - index;
  const scale = Math.max(0.95, 1 - stackOffset * 0.02);
  const opacity = Math.max(0.7, 1 - stackOffset * 0.1);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const duration = toast.duration ?? 5000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        context?.removeToast(toast.id);
      }, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, context]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      context?.removeToast(toast.id);
    }, 200);
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative",
        "flex items-start gap-3 p-4",
        "border clip-notch",
        "transition-all duration-normal ease-out-expo",
        styles,
        isVisible && !isLeaving ? "translate-x-0" : "translate-x-8",
      )}
      style={{
        transform: isVisible && !isLeaving ? `scale(${scale})` : undefined,
        opacity: isVisible && !isLeaving ? opacity : 0,
        transformOrigin: "bottom right",
      }}
      role="alert"
    >
      {/* Bracket decorations */}
      <div
        className={cn(
          "absolute -top-px -left-px w-2 h-2 border-l border-t",
          borderAccent,
        )}
      />
      <div
        className={cn(
          "absolute -bottom-px -right-px w-2 h-2 border-r border-b",
          borderAccent,
        )}
      />

      <div className={cn("flex-shrink-0", iconColor)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-body-sm text-gray-400 mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className={cn(
          "flex-shrink-0 p-1",
          "text-gray-500 hover:text-white",
          "clip-notch-sm",
          "transition-colors duration-fast",
        )}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
