import { createGroupRequest } from "@/lib/api/group";

import { useGroupMutation } from "./useGroupMutation";

export function useCreateGroup() {
  const { mutate, isPending, error } = useGroupMutation({
    mutationFn: createGroupRequest,
    fallbackMessage: "Nie udało się utworzyć grupy. Spróbuj ponownie.",
    statusMessages: { 422: "Sprawdź poprawność danych grupy" },
  });

  return { createGroup: mutate, isCreating: isPending, error };
}
