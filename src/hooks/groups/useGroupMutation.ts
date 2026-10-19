import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";

type UseGroupMutationOptions<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  fallbackMessage: string;
  statusMessages?: Partial<Record<number, string>>;
};

export function useGroupMutation<TVariables>({
  mutationFn,
  fallbackMessage,
  statusMessages = {},
}: UseGroupMutationOptions<TVariables>) {
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, TVariables>({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        const message =
          error instanceof ApiError ? statusMessages[error.status] : undefined;
        throw new Error(message ?? fallbackMessage);
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
  });

  return {
    mutate: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
