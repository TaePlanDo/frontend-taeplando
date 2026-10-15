import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { deleteGroupRequest } from "@/lib/api/group";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";

function deleteGroupErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Grupa nie istnieje";
  }
  return "Nie udało się usunąć grupy. Spróbuj ponownie.";
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteGroupRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.details() });
    },
  });

  const deleteGroup = useCallback(
    async (id: string) => {
      await mutation.mutateAsync(id);
    },
    [mutation],
  );

  return {
    deleteGroup,
    isDeleting: mutation.isPending,
    error: mutation.isError ? deleteGroupErrorMessage(mutation.error) : null,
  };
}
