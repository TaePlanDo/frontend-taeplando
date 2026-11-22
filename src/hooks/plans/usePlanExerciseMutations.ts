import { useEntityMutation } from "@/hooks/useEntityMutation";
import {
  deletePlanExerciseRequest,
  replacePlanExerciseRequest,
} from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";

export function usePlanExerciseMutations() {
  const replace = useEntityMutation({
    mutationFn: replacePlanExerciseRequest,
    invalidateKey: queryKeys.plans.all,
    fallbackMessage: "Nie udało się wymienić ćwiczenia. Spróbuj ponownie.",
    networkMode: "always",
  });
  const remove = useEntityMutation({
    mutationFn: deletePlanExerciseRequest,
    invalidateKey: queryKeys.plans.all,
    fallbackMessage: "Nie udało się usunąć ćwiczenia. Spróbuj ponownie.",
    networkMode: "always",
  });

  return { replace, remove };
}
