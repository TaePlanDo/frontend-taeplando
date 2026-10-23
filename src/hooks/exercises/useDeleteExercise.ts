import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteExerciseRequest } from "@/lib/api/exercise";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  const mutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      try {
        await deleteExerciseRequest(id);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          throw new Error("Ćwiczenie już nie istnieje");
        }
        throw new Error("Nie udało się usunąć ćwiczenia. Spróbuj ponownie.");
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all }),
  });

  return {
    deleteExercise: mutation.mutateAsync,
    isDeleting: mutation.isPending,
  };
}
