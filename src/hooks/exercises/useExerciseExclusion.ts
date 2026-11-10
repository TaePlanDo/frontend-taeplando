import { useQueryClient } from "@tanstack/react-query";

import {
  excludeExerciseRequest,
  reactivateExerciseRequest,
} from "@/lib/api/exercise";
import { queryKeys } from "@/lib/queryKeys";
import type { Exercise } from "@/types/exercise";
import type { PaginatedResponse } from "@/types/pagination";

import { useExerciseMutation } from "./useExerciseMutation";

export function useExerciseExclusion() {
  const queryClient = useQueryClient();
  const result = useExerciseMutation({
    mutationFn: async ({ id, excluded }: { id: string; excluded: boolean }) => {
      await (excluded
        ? excludeExerciseRequest(id)
        : reactivateExerciseRequest(id));
      queryClient.setQueriesData<PaginatedResponse<Exercise>>(
        { queryKey: queryKeys.exercises.listsByStatus() },
        (page) => {
          if (!page?.items.some((exercise) => exercise.id === id))
            return undefined;
          return {
            ...page,
            items: page.items.map((exercise) =>
              exercise.id === id
                ? { ...exercise, status: excluded ? "SUSPENDED" : "ACTIVE" }
                : exercise,
            ),
          };
        },
      );
    },
    fallbackMessage:
      "Nie udało się zmienić wykluczenia ćwiczenia. Spróbuj ponownie.",
    statusMessages: { 404: "Ćwiczenie jest niedostępne" },
  });

  return {
    setExclusion: result.mutate,
    isPending: result.isPending,
    error: result.error,
  };
}
