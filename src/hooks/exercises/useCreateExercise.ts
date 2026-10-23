import { createExerciseRequest } from "@/lib/api/exercise";
import { useExerciseMutation } from "./useExerciseMutation";
export function useCreateExercise() {
  const result = useExerciseMutation({
    mutationFn: createExerciseRequest,
    fallbackMessage: "Nie udało się utworzyć ćwiczenia. Spróbuj ponownie.",
    statusMessages: { 422: "Sprawdź poprawność danych i wybranych atrybutów" },
  });
  return {
    createExercise: result.mutate,
    isCreating: result.isPending,
    error: result.error,
  };
}
