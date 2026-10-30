import type { ExerciseListFilters } from "@/types/exercise-list-filters";

import {
  appendExerciseListFilters,
  EXERCISE_LIST_FILTER_PARAM_KEYS,
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

/** Replace only this screen's parameters, preserving unrelated query state. */
export function replaceExerciseListSearchParams(
  current: URLSearchParams,
  state: ExerciseListSearchState,
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const key of [...EXERCISE_LIST_FILTER_PARAM_KEYS, "page"]) {
    next.delete(key);
  }
  toExerciseListSearchParams(state).forEach((value, key) => {
    next.set(key, value);
  });
  return next;
}
