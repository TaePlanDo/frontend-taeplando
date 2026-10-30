import { z } from "zod";

export const equipmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nazwa sprzętu jest wymagana")
    .max(255, "Nazwa sprzętu może mieć maksymalnie 255 znaków"),
});

export type EquipmentFormValues = z.input<typeof equipmentFormSchema>;
export type EquipmentFormOutput = z.output<typeof equipmentFormSchema>;
