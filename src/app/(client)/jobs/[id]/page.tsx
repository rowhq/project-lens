"use client";

/**
 * Job Detail Page - Redirect to Orders
 *
 * This page redirects to /orders/[id] for consistency.
 * The orders page handles all job/order details for clients.
 */

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      router.replace(`/orders/${jobId}`);
    }
  }, [jobId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
      <p className="text-sm text-[var(--muted-foreground)] font-mono">
        Loading job details...
      </p>
    </div>
  );
}
