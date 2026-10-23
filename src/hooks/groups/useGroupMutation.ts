import { useEntityMutation } from "@/hooks/useEntityMutation";
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
  return useEntityMutation({
    mutationFn,
    invalidateKey: queryKeys.groups.all,
    fallbackMessage,
    statusMessages,
  });
}
