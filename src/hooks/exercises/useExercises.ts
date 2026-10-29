import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getExercisesRequest } from "@/lib/api/exercise";
import { queryKeys } from "@/lib/queryKeys";
import type { ExerciseListFilters } from "@/types/exercise-list-filters";

type UseExercisesOptions = {
  filters?: ExerciseListFilters;
  page: number;
  onPageChange: (page: number) => void;
};

export function useExercises({
  filters = {},
  page,
  onPageChange,
}: UseExercisesOptions) {
  return usePaginatedList({
    queryKey: [...queryKeys.exercises.lists(), filters],
    fetchPage: (currentPage, pageSize) =>
      getExercisesRequest(currentPage, pageSize, filters),
    page,
    onPageChange,
  });
}
