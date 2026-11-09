import {
  parseListSearchParams,
  replaceListSearchParams,
  toListSearchParams,
} from "@/lib/filters/search-params";
import type { ExerciseListFilters } from "@/types/exercise-list-filters";

import { EXERCISE_FILTER_CONFIG } from "./exercise-list-filters";

export type ExerciseListSearchState = {
  filters: ExerciseListFilters;
  page: number;
};

export function parseExerciseListSearchParams(
  params: URLSearchParams,
): ExerciseListSearchState {
  return parseListSearchParams(
    params,
    EXERCISE_FILTER_CONFIG,
  ) as ExerciseListSearchState;
}

export function toExerciseListSearchParams(
  state: ExerciseListSearchState,
): URLSearchParams {
  return toListSearchParams(state, EXERCISE_FILTER_CONFIG);
}

export function replaceExerciseListSearchParams(
  current: URLSearchParams,
  state: ExerciseListSearchState,
): URLSearchParams {
  return replaceListSearchParams(current, state, EXERCISE_FILTER_CONFIG);
}
