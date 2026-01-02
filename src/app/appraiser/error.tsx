"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppraiserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Appraiser portal error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center px-4">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Something went wrong
        </h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[var(--primary)] text-black font-medium rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
          <Link
            href="/appraiser/dashboard"
            className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)]"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
