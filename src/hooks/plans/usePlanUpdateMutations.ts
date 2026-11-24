import { useQueryClient } from "@tanstack/react-query";

import { useEntityMutation } from "@/hooks/useEntityMutation";
import {
  updatePlanNameRequest,
  updatePlanStructureRequest,
} from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";

export function usePlanUpdateMutations() {
  const queryClient = useQueryClient();
  const refreshPlan = ({ planId }: { planId: string }) => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.plans.detail(planId),
      exact: true,
    });
  };
  const rename = useEntityMutation({
    mutationFn: updatePlanNameRequest,
    invalidateKey: queryKeys.plans.lists(),
    fallbackMessage: "Nie udało się zmienić nazwy planu. Spróbuj ponownie.",
    networkMode: "always",
    onSuccess: refreshPlan,
  });
  const reorder = useEntityMutation({
    mutationFn: updatePlanStructureRequest,
    invalidateKey: queryKeys.plans.lists(),
    fallbackMessage:
      "Nie udało się zmienić kolejności ćwiczeń. Spróbuj ponownie.",
    networkMode: "always",
    onSuccess: refreshPlan,
  });

  return { rename, reorder, isPending: rename.isPending || reorder.isPending };
}
