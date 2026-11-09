import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  countActiveFilters,
  withoutFilterDimension,
} from "@/lib/plans/plan-list-filter-chips";
import { normalizeFilters } from "@/lib/plans/plan-list-filters";
import {
  parsePlanListSearchParams,
  replacePlanListSearchParams,
  type PlanListSearchState,
} from "@/lib/plans/plan-list-search-params";
import type {
  PlanActiveFilterDimension,
  PlanListFilters,
} from "@/types/plan-list-filters";

export function usePlanListSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(
    () => parsePlanListSearchParams(searchParams),
    [searchParams],
  );

  const commit = useCallback(
    (update: (current: PlanListSearchState) => PlanListSearchState) => {
      setSearchParams(
        (prev) =>
          replacePlanListSearchParams(
            prev,
            update(parsePlanListSearchParams(prev)),
          ),
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setFilters = useCallback(
    (filters: PlanListFilters) => {
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
    (dimension: PlanActiveFilterDimension) => {
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
