import {
  appendFilters,
  normalizeFilters as normalizeGeneric,
  type FilterConfig,
} from "@/lib/filters/engine";
import {
  AGE_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  type ExerciseListFilters,
} from "@/types/exercise-list-filters";

export const EXERCISE_FILTER_CONFIG: FilterConfig = {
  fields: [
    { key: "name", kind: "string" },
    { key: "min_age", kind: "int" },
    { key: "max_age", kind: "int" },
    { key: "min_participants", kind: "int" },
    { key: "max_participants", kind: "int" },
    { key: "equipment_ids", kind: "stringCsv" },
    { key: "training_type_ids", kind: "stringCsv" },
    { key: "segment_ids", kind: "intCsv" },
  ],
  ranges: [
    { minKey: "min_age", maxKey: "max_age", bounds: AGE_FILTER_BOUNDS },
    {
      minKey: "min_participants",
      maxKey: "max_participants",
      bounds: PARTICIPANTS_FILTER_BOUNDS,
    },
  ],
};

export function normalizeFilters(
  filters: ExerciseListFilters,
): ExerciseListFilters {
  return normalizeGeneric(
    filters,
    EXERCISE_FILTER_CONFIG,
  ) as ExerciseListFilters;
}

export function appendExerciseListFilters(
  params: URLSearchParams,
  filters: ExerciseListFilters,
): void {
  appendFilters(params, filters, EXERCISE_FILTER_CONFIG);
}
