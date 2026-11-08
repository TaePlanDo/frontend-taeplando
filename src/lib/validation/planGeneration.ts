import { z } from "zod";

import { PLAN_GENERATION_LIMITS } from "@/lib/constants/planGeneration";

export const planGenerationSchema = z.object({
  trainingGroupId: z.string().trim().min(1, "Wybierz grupę treningową"),
  participantCount: z
    .number({ error: "Podaj liczbę uczestników" })
    .int("Liczba uczestników musi być liczbą całkowitą")
    .min(
      PLAN_GENERATION_LIMITS.MIN_PARTICIPANTS,
      `Liczba uczestników musi wynosić co najmniej ${PLAN_GENERATION_LIMITS.MIN_PARTICIPANTS}`,
    )
    .max(
      PLAN_GENERATION_LIMITS.MAX_PARTICIPANTS,
      `Liczba uczestników nie może przekraczać ${PLAN_GENERATION_LIMITS.MAX_PARTICIPANTS}`,
    ),
  equipmentIds: z
    .array(z.string().trim().min(1, "Wybierz poprawny sprzęt"))
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Sprzęt nie może się powtarzać",
    ),
  trainingTypeId: z
    .string()
    .trim()
    .min(1, "Wybierz typ treningu lub Auto")
    .nullable(),
});

export type PlanGenerationFormValues = z.input<typeof planGenerationSchema>;
export type PlanGenerationFormOutput = z.output<typeof planGenerationSchema>;
