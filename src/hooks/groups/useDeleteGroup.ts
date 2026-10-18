import { deleteGroupRequest } from "@/lib/api/group";

import { useGroupMutation } from "./useGroupMutation";

export function useDeleteGroup() {
  const { mutate, isPending, error } = useGroupMutation({
    mutationFn: deleteGroupRequest,
    fallbackMessage: "Nie udało się usunąć grupy. Spróbuj ponownie.",
    statusMessages: { 404: "Grupa nie istnieje" },
  });

  return { deleteGroup: mutate, isDeleting: isPending, error };
}
