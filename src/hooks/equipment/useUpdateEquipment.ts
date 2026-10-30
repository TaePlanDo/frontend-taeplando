import { updateEquipmentRequest } from "@/lib/api/equipment";
import type { EquipmentWrite } from "@/types/equipment";

import { useEquipmentMutation } from "./useEquipmentMutation";

export function useUpdateEquipment() {
  const { mutate, isPending, error } = useEquipmentMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EquipmentWrite }) =>
      updateEquipmentRequest(id, payload),
    fallbackMessage: "Nie udało się zaktualizować sprzętu. Spróbuj ponownie.",
    statusMessages: {
      404: "Sprzęt nie istnieje",
      422: "Sprawdź poprawność nazwy sprzętu",
    },
  });

  return {
    updateEquipment: (id: string, payload: EquipmentWrite) =>
      mutate({ id, payload }),
    isUpdating: isPending,
    error,
  };
}
