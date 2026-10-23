import { updateGroupSchemaRequest } from "@/lib/api/group";
import type { GroupSchemaWrite } from "@/types/group";

import { useGroupMutation } from "./useGroupMutation";

export function useUpdateGroupSchema() {
  const { mutate, isPending, error } = useGroupMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GroupSchemaWrite }) =>
      updateGroupSchemaRequest(id, payload),
    fallbackMessage: "Nie udało się zapisać schematu. Spróbuj ponownie.",
    statusMessages: {
      404: "Grupa nie istnieje",
      422: "Sprawdź poprawność schematu (suma 100%, każdy segment co najmniej 1%)",
    },
  });

  return {
    updateGroupSchema: (id: string, payload: GroupSchemaWrite) =>
      mutate({ id, payload }),
    isUpdating: isPending,
    error,
  };
}
