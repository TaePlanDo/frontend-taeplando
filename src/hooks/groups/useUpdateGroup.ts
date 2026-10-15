import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { updateGroupRequest } from "@/lib/api/group";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";
import type { GroupWrite } from "@/types/group";

function updateGroupErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Grupa nie istnieje";
  }
  if (error instanceof ApiError && error.status === 422) {
    return "Sprawdź poprawność danych grupy";
  }
  return "Nie udało się zaktualizować grupy. Spróbuj ponownie.";
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: GroupWrite }) =>
      updateGroupRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.details() });
    },
  });

  const updateGroup = useCallback(
    async (id: string, payload: GroupWrite) => {
      await mutation.mutateAsync({ id, payload });
    },
    [mutation],
  );

  return {
    updateGroup,
    isUpdating: mutation.isPending,
    error: mutation.isError ? updateGroupErrorMessage(mutation.error) : null,
  };
}
