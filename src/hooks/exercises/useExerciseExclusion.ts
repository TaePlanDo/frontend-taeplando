import {
  excludeExerciseRequest,
  reactivateExerciseRequest,
} from "@/lib/api/exercise";

import { useExerciseMutation } from "./useExerciseMutation";

export function useExerciseExclusion() {
  const result = useExerciseMutation({
    mutationFn: ({ id, excluded }: { id: string; excluded: boolean }) =>
      excluded ? excludeExerciseRequest(id) : reactivateExerciseRequest(id),
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
