import { updateGroupRequest } from "@/lib/api/group";
import type { GroupWrite } from "@/types/group";

import { useGroupMutation } from "./useGroupMutation";

export function useUpdateGroup() {
  const { mutate, isPending, error } = useGroupMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GroupWrite }) =>
      updateGroupRequest(id, payload),
    fallbackMessage: "Nie udało się zaktualizować grupy. Spróbuj ponownie.",
    statusMessages: {
      404: "Grupa nie istnieje",
      422: "Sprawdź poprawność danych grupy",
    },
  });

  return {
    updateGroup: (id: string, payload: GroupWrite) => mutate({ id, payload }),
    isUpdating: isPending,
    error,
  };
}
