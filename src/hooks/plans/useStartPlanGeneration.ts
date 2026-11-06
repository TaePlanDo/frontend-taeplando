import { startPlanGenerationRequest } from "@/lib/api/plan-generation";
import { useEntityMutation } from "@/hooks/useEntityMutation";
import type { PlanGenerationParameters } from "@/types/plan";

export function useStartPlanGeneration() {
  const { mutate, isPending, error, reset } = useEntityMutation({
    mutationFn: (parameters: PlanGenerationParameters) =>
      startPlanGenerationRequest(parameters),
    fallbackMessage:
      "Nie udało się rozpocząć generowania planu. Spróbuj ponownie.",
    statusMessages: {
      422: "Sprawdź poprawność parametrów generowania planu",
    },
  });

  return {
    startPlanGeneration: mutate,
    isStarting: isPending,
    error,
    reset,
  };
}
