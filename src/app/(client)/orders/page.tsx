"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Redirect page for legacy /orders route
 * Orders have been unified with Appraisals - all orders are now viewed
 * through the Appraisals page with their associated Jobs visible inline.
 */
export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified appraisals view
    router.replace("/appraisals");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
        <p className="text-[var(--muted-foreground)]">
          Redirecting to Appraisals...
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Orders are now managed through the Appraisals page.
        </p>
      </div>
    </div>
  );
}
