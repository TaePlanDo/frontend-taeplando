import { useListSearchParams } from "@/hooks/filters/useListSearchParams";
import {
  countActiveFilters,
  withoutFilterDimension,
} from "@/lib/exercises/exercise-list-filter-chips";
import { normalizeFilters } from "@/lib/exercises/exercise-list-filters";
import {
  parseExerciseListSearchParams,
  replaceExerciseListSearchParams,
} from "@/lib/exercises/exercise-list-search-params";
import type { ExerciseListFilters } from "@/types/exercise-list-filters";

export function useExerciseListSearchParams() {
  return useListSearchParams<ExerciseListFilters>({
    parse: parseExerciseListSearchParams,
    replace: replaceExerciseListSearchParams,
    normalize: normalizeFilters,
    without: withoutFilterDimension,
    count: countActiveFilters,
  });
}
