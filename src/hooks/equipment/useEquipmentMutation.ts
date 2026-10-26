import { useEntityMutation } from "@/hooks/useEntityMutation";
import { queryKeys } from "@/lib/queryKeys";

type UseEquipmentMutationOptions<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>;
  fallbackMessage: string;
  statusMessages?: Partial<Record<number, string>>;
};

export function useEquipmentMutation<TVariables>({
  mutationFn,
  fallbackMessage,
  statusMessages = {},
}: UseEquipmentMutationOptions<TVariables>) {
  return useEntityMutation({
    mutationFn,
    invalidateKey: queryKeys.equipment.all,
    fallbackMessage,
    statusMessages,
  });
}
