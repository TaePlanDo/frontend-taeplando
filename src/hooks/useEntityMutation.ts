import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";

type EntityMutationOptions<TVariables, TResult> = {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  invalidateKey: QueryKey;
  fallbackMessage: string;
  statusMessages?: Partial<Record<number, string>>;
};

export function useEntityMutation<TVariables, TResult>({
  mutationFn,
  invalidateKey,
  fallbackMessage,
  statusMessages = {},
}: EntityMutationOptions<TVariables, TResult>) {
  const queryClient = useQueryClient();
  const mutation = useMutation<TResult, Error, TVariables>({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        const message =
          error instanceof ApiError ? statusMessages[error.status] : undefined;
        throw new Error(message ?? fallbackMessage);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invalidateKey }),
  });

  return {
    mutate: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
