import { useQuery } from "@tanstack/react-query";

import { getPlanGenerationStatusRequest } from "@/lib/api/plan-generation";
import { isPlanGenerationInProgress } from "@/lib/plan/generationView";
import { queryKeys } from "@/lib/queryKeys";
import type { PlanGenerationJobStatus } from "@/types/plan";

const POLL_INTERVAL_MS = 1500;

export function generationPollIntervalMs(
  status: PlanGenerationJobStatus | undefined,
): number | false {
  return isPlanGenerationInProgress(status) ? POLL_INTERVAL_MS : false;
}

export function usePlanGenerationStatus(jobId: string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.planGeneration.status(jobId ?? ""),
    queryFn: () => getPlanGenerationStatusRequest(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (current) =>
      generationPollIntervalMs(current.state.data?.status),
  });

  return {
    job: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
