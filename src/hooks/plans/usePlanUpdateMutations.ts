import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const reorder = useMutation({
    networkMode: "always",
    mutationFn: async ({
      planId,
      optimisticPlan,
    }: {
      planId: string;
      optimisticPlan: PlanDetail;
    }) => {
      try {
        return await updatePlanStructureRequest({
          planId,
          planExerciseIds: optimisticPlan.exercises.map(
            (exercise) => exercise.id,
          ),
        });
      } catch {
        throw new Error(
          "Nie udało się zmienić kolejności ćwiczeń. Spróbuj ponownie.",
        );
      }
    },
    onMutate: async ({ planId, optimisticPlan }) => {
      const key = queryKeys.plans.detail(planId);
      await queryClient.cancelQueries({ queryKey: key, exact: true });
      const previous = queryClient.getQueryData<PlanDetail>(key);
      queryClient.setQueryData(key, optimisticPlan);
      return { previous };
    },
    onError: (_error, { planId }, context) => {
      if (context?.previous)
        queryClient.setQueryData(
          queryKeys.plans.detail(planId),
          context.previous,
        );
    },
    onSuccess: async (updatedPlan, variables) => {
      await savePlan(variables, updatedPlan);
      void queryClient.invalidateQueries({ queryKey: queryKeys.plans.lists() });
    },
  });

  return {
    rename,
    reorder: { mutate: reorder.mutateAsync, isPending: reorder.isPending },
    isPending: rename.isPending || reorder.isPending,
  };
}
