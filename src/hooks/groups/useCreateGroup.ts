import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { createGroupRequest } from "@/lib/api/group";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";
import type { GroupWrite } from "@/types/group";

function createGroupErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) {
    return "Sprawdź poprawność danych grupy";
  }
  return "Nie udało się utworzyć grupy. Spróbuj ponownie.";
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createGroupRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });
    },
  });

  const createGroup = useCallback(
    async (payload: GroupWrite) => {
      await mutation.mutateAsync(payload);
    },
    [mutation],
  );

  return {
    createGroup,
    isCreating: mutation.isPending,
    error: mutation.isError ? createGroupErrorMessage(mutation.error) : null,
  };
}
