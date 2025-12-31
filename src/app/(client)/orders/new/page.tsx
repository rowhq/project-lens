"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Redirect page for legacy /orders/new route
 * Orders have been unified with Appraisals - on-site inspections are now
 * automatically created as Jobs when purchasing AI Report with On-Site or
 * Certified Appraisal types.
 */
export default function NewOrderPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified appraisal creation flow
    router.replace("/appraisals/new");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
        <p className="text-[var(--muted-foreground)]">
          Redirecting to Appraisals...
        </p>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          On-site inspections are now included in the appraisal order flow.
        </p>
      </div>
    </div>
  );
}
