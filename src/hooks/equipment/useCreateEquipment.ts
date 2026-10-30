import { createEquipmentRequest } from "@/lib/api/equipment";

import { useEquipmentMutation } from "./useEquipmentMutation";

export function useCreateEquipment() {
  const { mutate, isPending, error } = useEquipmentMutation({
    mutationFn: createEquipmentRequest,
    fallbackMessage: "Nie udało się utworzyć sprzętu. Spróbuj ponownie.",
    statusMessages: { 422: "Sprawdź poprawność nazwy sprzętu" },
  });

  return { createEquipment: mutate, isCreating: isPending, error };
}
