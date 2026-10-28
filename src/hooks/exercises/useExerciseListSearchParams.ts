import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { normalizeFilters } from "@/lib/exercises/exercise-list-filters";
import {
  countActiveFilters,
  withoutFilterDimension,
} from "@/lib/exercises/filter-dimensions";
import {
  parseExerciseListSearchParams,
  toExerciseListSearchParams,
  type ExerciseListSearchState,
} from "@/lib/exercises/exercise-list-search-params";
import type {
  ActiveFilterDimension,
  ExerciseListFilters,
} from "@/types/exercise-list-filters";

export function useExerciseListSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(
    () => parseExerciseListSearchParams(searchParams),
    [searchParams],
  );

  const commit = useCallback(
    (update: (current: ExerciseListSearchState) => ExerciseListSearchState) => {
      setSearchParams(
        (prev) =>
          toExerciseListSearchParams(
            update(parseExerciseListSearchParams(prev)),
          ),
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setFilters = useCallback(
    (filters: ExerciseListFilters) => {
      commit(() => ({ filters: normalizeFilters(filters), page: 1 }));
    },
    [commit],
  );

  const setPage = useCallback(
    (page: number) => {
      commit((current) => ({ ...current, page }));
    },
    [commit],
  );

  const setName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      commit((current) => ({
        filters: normalizeFilters({
          ...current.filters,
          name: trimmed || undefined,
        }),
        page: 1,
      }));
    },
    [commit],
  );

  const clearDimension = useCallback(
    (dimension: ActiveFilterDimension) => {
      commit((current) => ({
        filters: withoutFilterDimension(current.filters, dimension),
        page: 1,
      }));
    },
    [commit],
  );

  return {
    filters: state.filters,
    page: state.page,
    dialogFilterCount: countActiveFilters(state.filters, {
      exclude: ["name"],
    }),
    hasActiveFilters: countActiveFilters(state.filters) > 0,
    setFilters,
    setPage,
    setName,
    clearDimension,
  };
}
