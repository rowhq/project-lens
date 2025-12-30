"use client";

import { trpc } from "@/shared/lib/trpc";
import { useCallback } from "react";

/**
 * Hook for appraisal operations
 */
export function useAppraisals() {
  const utils = trpc.useUtils();

  const appraisalsQuery = trpc.appraisal.list.useQuery({
    limit: 20,
  });

  const createMutation = trpc.appraisal.create.useMutation({
    onSuccess: () => {
      utils.appraisal.list.invalidate();
    },
  });

  const cancelMutation = trpc.appraisal.cancel.useMutation({
    onSuccess: () => {
      utils.appraisal.list.invalidate();
    },
  });

  const createAppraisal = useCallback(
    async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  const cancelAppraisal = useCallback(
    async (id: string) => {
      return cancelMutation.mutateAsync({ id });
    },
    [cancelMutation]
  );

  return {
    appraisals: appraisalsQuery.data?.items ?? [],
    isLoading: appraisalsQuery.isLoading,
    error: appraisalsQuery.error,
    createAppraisal,
    cancelAppraisal,
    isCreating: createMutation.isPending,
    isCancelling: cancelMutation.isPending,
    refetch: appraisalsQuery.refetch,
  };
}

/**
 * Hook for a single appraisal
 */
export function useAppraisal(id: string) {
  const appraisalQuery = trpc.appraisal.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  return {
    appraisal: appraisalQuery.data,
    isLoading: appraisalQuery.isLoading,
    error: appraisalQuery.error,
    refetch: appraisalQuery.refetch,
  };
}
