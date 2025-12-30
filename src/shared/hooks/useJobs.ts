"use client";

import { trpc } from "@/shared/lib/trpc";
import { useCallback } from "react";

/**
 * Hook for appraiser jobs
 */
export function useJobs() {
  const utils = trpc.useUtils();

  const availableQuery = trpc.job.available.useQuery({
    limit: 20,
  });

  const acceptedQuery = trpc.job.history.useQuery({
    limit: 20,
  });

  const acceptMutation = trpc.job.accept.useMutation({
    onSuccess: () => {
      utils.job.available.invalidate();
      utils.job.history.invalidate();
    },
  });

  const startMutation = trpc.job.start.useMutation({
    onSuccess: () => {
      utils.job.history.invalidate();
    },
  });

  const submitMutation = trpc.job.submit.useMutation({
    onSuccess: () => {
      utils.job.history.invalidate();
    },
  });

  const acceptJob = useCallback(
    async (id: string) => {
      return acceptMutation.mutateAsync({ jobId: id });
    },
    [acceptMutation]
  );

  const startJob = useCallback(
    async (id: string, latitude: number, longitude: number) => {
      return startMutation.mutateAsync({ jobId: id, latitude, longitude });
    },
    [startMutation]
  );

  const submitJob = useCallback(
    async (id: string, notes?: string) => {
      return submitMutation.mutateAsync({ jobId: id, notes });
    },
    [submitMutation]
  );

  return {
    availableJobs: availableQuery.data ?? [],
    acceptedJobs: acceptedQuery.data ?? [],
    isLoading: availableQuery.isLoading || acceptedQuery.isLoading,
    error: availableQuery.error || acceptedQuery.error,
    acceptJob,
    startJob,
    submitJob,
    isAccepting: acceptMutation.isPending,
    isStarting: startMutation.isPending,
    isSubmitting: submitMutation.isPending,
    refetch: () => {
      availableQuery.refetch();
      acceptedQuery.refetch();
    },
  };
}

/**
 * Hook for a single job
 */
export function useJob(id: string) {
  const utils = trpc.useUtils();

  const jobQuery = trpc.job.getById.useQuery({ id }, { enabled: !!id });

  const acceptMutation = trpc.job.accept.useMutation({
    onSuccess: () => {
      utils.job.getById.invalidate({ id });
    },
  });

  const startMutation = trpc.job.start.useMutation({
    onSuccess: () => {
      utils.job.getById.invalidate({ id });
    },
  });

  const submitMutation = trpc.job.submit.useMutation({
    onSuccess: () => {
      utils.job.getById.invalidate({ id });
    },
  });

  return {
    job: jobQuery.data,
    isLoading: jobQuery.isLoading,
    error: jobQuery.error,
    accept: () => acceptMutation.mutateAsync({ jobId: id }),
    start: (latitude: number, longitude: number) => startMutation.mutateAsync({ jobId: id, latitude, longitude }),
    submit: (notes?: string) => submitMutation.mutateAsync({ jobId: id, notes }),
    isAccepting: acceptMutation.isPending,
    isStarting: startMutation.isPending,
    isSubmitting: submitMutation.isPending,
    refetch: jobQuery.refetch,
  };
}
