import { deleteEquipmentRequest } from "@/lib/api/equipment";

import { useEquipmentMutation } from "./useEquipmentMutation";

export function useDeleteEquipment() {
  const { mutate, isPending, error } = useEquipmentMutation({
    mutationFn: deleteEquipmentRequest,
    fallbackMessage: "Nie udało się usunąć sprzętu. Spróbuj ponownie.",
    statusMessages: { 404: "Sprzęt już nie istnieje" },
  });

  return { deleteEquipment: mutate, isDeleting: isPending, error };
}
