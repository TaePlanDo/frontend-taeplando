import { deleteExerciseRequest } from "@/lib/api/exercise";
import { useExerciseMutation } from "./useExerciseMutation";
export function useDeleteExercise() {
  const result = useExerciseMutation({
    mutationFn: deleteExerciseRequest,
    fallbackMessage: "Nie udało się usunąć ćwiczenia. Spróbuj ponownie.",
    statusMessages: { 404: "Ćwiczenie już nie istnieje" },
  });
  return {
    deleteExercise: result.mutate,
    isDeleting: result.isPending,
    error: result.error,
  };
}
