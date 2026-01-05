/**
 * Toast hook wrapper
 * Provides a consistent API for toast notifications using the shadcn-style interface
 */

import { useCallback, useMemo } from "react";
import { useToast as useToastInternal } from "@/shared/components/ui/Toast";

// Compatible toast function interface that works with shadcn-style toast API
interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

/**
 * Hook that provides a toast function compatible with shadcn/ui style API
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast({ title: "Success", description: "Your changes have been saved." });
 *   toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
 */
export function useToast(): { toast: (options: ToastOptions) => void } {
  const { error, success } = useToastInternal();

  const toast = useCallback(
    (options: ToastOptions) => {
      if (options.variant === "destructive") {
        error(options.title, options.description);
      } else {
        success(options.title, options.description);
      }
    },
    [error, success],
  );

  return useMemo(() => ({ toast }), [toast]);
}
