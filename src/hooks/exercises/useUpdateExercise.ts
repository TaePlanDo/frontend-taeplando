import { updateExerciseRequest } from "@/lib/api/exercise";
import type { ExerciseWrite } from "@/types/exercise";
import { useExerciseMutation } from "./useExerciseMutation";
export function useUpdateExercise() {
  const result = useExerciseMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ExerciseWrite }) =>
      updateExerciseRequest(id, payload),
    fallbackMessage: "Nie udało się zaktualizować ćwiczenia. Spróbuj ponownie.",
    statusMessages: {
      404: "Ćwiczenie nie istnieje lub nie można go edytować",
      422: "Sprawdź poprawność danych i wybranych atrybutów",
    },
  });
  return {
    updateExercise: result.mutate,
    isUpdating: result.isPending,
    error: result.error,
  };
}
