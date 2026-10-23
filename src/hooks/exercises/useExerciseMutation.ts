import { useEntityMutation } from "@/hooks/useEntityMutation";
import { queryKeys } from "@/lib/queryKeys";

type Options<T> = {
  mutationFn: (variables: T) => Promise<unknown>;
  fallbackMessage: string;
  statusMessages?: Partial<Record<number, string>>;
};

export function useExerciseMutation<T>({
  mutationFn,
  fallbackMessage,
  statusMessages = {},
}: Options<T>) {
  return useEntityMutation({
    mutationFn,
    invalidateKey: queryKeys.exercises.all,
    fallbackMessage,
    statusMessages,
  });
}
