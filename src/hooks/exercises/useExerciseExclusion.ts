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
    mutationFn: ({ id, excluded }: { id: string; excluded: boolean }) =>
      excluded ? excludeExerciseRequest(id) : reactivateExerciseRequest(id),
    fallbackMessage:
      "Nie udało się zmienić wykluczenia ćwiczenia. Spróbuj ponownie.",
    statusMessages: { 404: "Ćwiczenie jest niedostępne" },
  });

  return {
    setExclusion: async (variables: { id: string; excluded: boolean }) => {
      await result.mutate(variables);
      queryClient.setQueriesData<PaginatedResponse<Exercise>>(
        { queryKey: queryKeys.exercises.lists() },
        (page) =>
          page && {
            ...page,
            items: page.items.map((exercise) =>
              exercise.id === variables.id
                ? {
                    ...exercise,
                    status: variables.excluded ? "SUSPENDED" : "ACTIVE",
                  }
                : exercise,
            ),
          },
      );
    },
    isPending: result.isPending,
    error: result.error,
  };
}
