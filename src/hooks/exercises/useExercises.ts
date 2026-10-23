import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getExercisesRequest } from "@/lib/api/exercise";
import { queryKeys } from "@/lib/queryKeys";

export function useExercises() {
  return usePaginatedList({
    queryKey: queryKeys.exercises.lists(),
    fetchPage: getExercisesRequest,
  });
}
