import { useQueryClient } from "@tanstack/react-query";

import { useEntityMutation } from "@/hooks/useEntityMutation";
import {
  updatePlanNameRequest,
  updatePlanStructureRequest,
} from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";
import type { PlanDetail } from "@/types/plan";

export function usePlanUpdateMutations() {
  const queryClient = useQueryClient();
  const savePlan = async ({ planId }: { planId: string }, plan: PlanDetail) => {
    const key = queryKeys.plans.detail(planId);
    await queryClient.cancelQueries({ queryKey: key, exact: true });
    queryClient.setQueryData(key, plan);
  };
  const rename = useEntityMutation({
    mutationFn: updatePlanNameRequest,
    invalidateKey: queryKeys.plans.lists(),
    fallbackMessage: "Nie udało się zmienić nazwy planu. Spróbuj ponownie.",
    networkMode: "always",
    onSuccess: savePlan,
  });
  const reorder = useEntityMutation({
    mutationFn: updatePlanStructureRequest,
    invalidateKey: queryKeys.plans.lists(),
    fallbackMessage:
      "Nie udało się zmienić kolejności ćwiczeń. Spróbuj ponownie.",
    networkMode: "always",
    onSuccess: savePlan,
  });

  return {
    rename,
    reorder,
    isPending: rename.isPending || reorder.isPending,
  };
}
