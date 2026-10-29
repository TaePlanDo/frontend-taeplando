import type { ExerciseListFilters } from "@/types/exercise-list-filters";

import {
  appendExerciseListFilters,
  parseExerciseListFilters,
  parsePositiveInt,
} from "./exercise-list-filters";

export type ExerciseListSearchState = {
  filters: ExerciseListFilters;
  page: number;
};

export function parseExerciseListSearchParams(
  params: URLSearchParams,
): ExerciseListSearchState {
  const page = Math.max(1, parsePositiveInt(params.get("page")) ?? 1);
  return {
    page,
    filters: parseExerciseListFilters(params),
  };
}

export function toExerciseListSearchParams({
  filters,
  page,
}: ExerciseListSearchState): URLSearchParams {
  const params = new URLSearchParams();
  appendExerciseListFilters(params, filters);
  if (page > 1) params.set("page", String(page));
  return params;
}
