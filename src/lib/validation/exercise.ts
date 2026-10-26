import { z } from "zod";

const positiveInteger = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} jest wymagany`)
    .regex(/^\d+$/, `${label} musi być liczbą całkowitą`)
    .transform(Number)
    .pipe(z.number().min(1, `${label} musi być większy od 0`));

export const exerciseFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nazwa ćwiczenia jest wymagana")
      .max(255, "Nazwa ćwiczenia może mieć maksymalnie 255 znaków"),
    description: z.string().trim().min(1, "Opis ćwiczenia jest wymagany"),
    minAge: positiveInteger("Minimalny wiek"),
    maxAge: positiveInteger("Maksymalny wiek"),
    minParticipants: positiveInteger("Minimalna liczba uczestników"),
    maxParticipants: positiveInteger("Maksymalna liczba uczestników"),
    durationMinutes: positiveInteger("Czas trwania"),
    equipmentIds: z.array(z.string()),
    trainingTypeIds: z
      .array(z.string())
      .min(1, "Wybierz co najmniej jeden Typ"),
    segmentIds: z
      .array(z.string())
      .min(1, "Wybierz co najmniej jeden Segment")
      .transform((ids) => ids.map(Number)),
  })
  .refine((values) => values.maxAge >= values.minAge, {
    message: "Maksymalny wiek nie może być mniejszy od minimalnego",
    path: ["maxAge"],
  })
  .refine((values) => values.maxParticipants >= values.minParticipants, {
    message:
      "Maksymalna liczba uczestników nie może być mniejsza od minimalnej",
    path: ["maxParticipants"],
  });

export type ExerciseFormValues = z.input<typeof exerciseFormSchema>;
export type ExerciseFormOutput = z.output<typeof exerciseFormSchema>;
