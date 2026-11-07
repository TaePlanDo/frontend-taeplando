import { useEntityMutation } from "@/hooks/useEntityMutation";
import { deletePlanRequest } from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";

export function useDeletePlan() {
  const { mutate, isPending, error } = useEntityMutation({
    mutationFn: deletePlanRequest,
    invalidateKey: queryKeys.plans.all,
    fallbackMessage: "Nie udało się usunąć planu. Spróbuj ponownie.",
    statusMessages: { 404: "Plan już nie istnieje" },
  });

  return { deletePlan: mutate, isDeleting: isPending, error };
}
