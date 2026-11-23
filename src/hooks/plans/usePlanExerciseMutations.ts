import { useQueryClient } from "@tanstack/react-query";

import { useEntityMutation } from "@/hooks/useEntityMutation";
import {
  deletePlanExerciseRequest,
  replacePlanExerciseRequest,
} from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";

export function usePlanExerciseMutations() {
  const queryClient = useQueryClient();
  const refreshPlan = ({ planId }: { planId: string }) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.plans.detail(planId),
      exact: true,
    });
  };
  const replace = useEntityMutation({
    mutationFn: replacePlanExerciseRequest,
    invalidateKey: queryKeys.plans.lists(),
    fallbackMessage: "Nie udało się wymienić ćwiczenia. Spróbuj ponownie.",
    networkMode: "always",
    onSuccess: refreshPlan,
  });
  const remove = useEntityMutation({
    mutationFn: deletePlanExerciseRequest,
    invalidateKey: queryKeys.plans.lists(),
    fallbackMessage: "Nie udało się usunąć ćwiczenia. Spróbuj ponownie.",
    networkMode: "always",
    onSuccess: refreshPlan,
  });

  return { replace, remove };
}
