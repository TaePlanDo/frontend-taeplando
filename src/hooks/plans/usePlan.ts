import { useQuery } from "@tanstack/react-query";

import { getPlanRequest } from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";

export function usePlan(planId: string | undefined) {
  const query = useQuery({
    queryKey: queryKeys.plans.detail(planId ?? ""),
    queryFn: () => getPlanRequest(planId!),
    enabled: Boolean(planId),
  });

  return {
    plan: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
