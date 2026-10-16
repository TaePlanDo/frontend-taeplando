import { z } from "zod";

import { GROUP_LIMITS } from "@/lib/constants/group";

const integerString = (messages: { required: string; invalid: string }) =>
  z
    .string()
    .trim()
    .min(1, { error: messages.required, abort: true })
    .regex(/^\d+$/, { error: messages.invalid, abort: true })
    .transform(Number);

const ageField = (label: string) =>
  integerString({
    required: `${label} jest wymagany`,
    invalid: `${label} musi być liczbą całkowitą`,
  }).pipe(
    z
      .number()
      .min(
        GROUP_LIMITS.MIN_AGE,
        `${label} nie może być mniejszy niż ${GROUP_LIMITS.MIN_AGE}`,
      )
      .max(
        GROUP_LIMITS.MAX_AGE,
        `${label} nie może być większy niż ${GROUP_LIMITS.MAX_AGE}`,
      ),
  );

export const groupDetailsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nazwa grupy jest wymagana")
      .max(255, "Nazwa grupy może mieć maksymalnie 255 znaków"),
    minAge: ageField("Minimalny wiek"),
    maxAge: ageField("Maksymalny wiek"),
    hours: integerString({
      required: "Podaj liczbę godzin",
      invalid: "Godziny muszą być liczbą całkowitą",
    }).pipe(
      z
        .number()
        .max(
          GROUP_LIMITS.MAX_HOURS,
          `Godziny nie mogą przekraczać ${GROUP_LIMITS.MAX_HOURS}`,
        ),
    ),
    minutes: integerString({
      required: "Podaj liczbę minut",
      invalid: "Minuty muszą być liczbą całkowitą",
    }).pipe(z.number().max(59, "Minuty muszą być w zakresie 0-59")),
  })
  .refine((d) => d.maxAge >= d.minAge, {
    message: "Maksymalny wiek nie może być mniejszy od minimalnego",
    path: ["maxAge"],
  })
  .refine((d) => d.hours * 60 + d.minutes > 0, {
    message: "Podaj czas trwania treningu",
    path: ["hours"],
  });

export type GroupDetailsFormValues = z.input<typeof groupDetailsSchema>;
export type GroupDetailsOutput = z.output<typeof groupDetailsSchema>;
