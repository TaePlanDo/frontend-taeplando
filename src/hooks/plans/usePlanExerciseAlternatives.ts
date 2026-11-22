import { useQuery } from "@tanstack/react-query";

import { getPlanExerciseAlternativesRequest } from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";

export function usePlanExerciseAlternatives(
  planId: string,
  planExerciseId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.plans.alternatives(planId, planExerciseId ?? ""),
    queryFn: () => getPlanExerciseAlternativesRequest(planId, planExerciseId!),
    enabled: Boolean(planId && planExerciseId),
  });
}
