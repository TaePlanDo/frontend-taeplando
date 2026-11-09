import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  activeDimensions,
  normalizeFilters,
  parseListSearchParams,
  replaceListSearchParams,
  withoutDimension,
  type FilterDimension,
  type ListSearchState,
} from "@/lib/filters/definition";

export function useListSearchParams<F extends Record<string, unknown>>(
  dimensions: FilterDimension<F>[],
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(
    () => parseListSearchParams(searchParams, dimensions),
    [searchParams, dimensions],
  );

  const commit = useCallback(
    (update: (current: ListSearchState<F>) => ListSearchState<F>) => {
      setSearchParams(
        (prev) =>
          replaceListSearchParams(
            prev,
            update(parseListSearchParams(prev, dimensions)),
            dimensions,
          ),
        { replace: true },
      );
    },
    [setSearchParams, dimensions],
  );

  const setFilters = useCallback(
    (filters: F) =>
      commit(() => ({
        filters: normalizeFilters(filters, dimensions),
        page: 1,
      })),
    [commit, dimensions],
  );

  const setPage = useCallback(
    (page: number) => commit((current) => ({ ...current, page })),
    [commit],
  );

  const clearDimension = useCallback(
    (dimension: string) =>
      commit((current) => ({
        filters: withoutDimension(current.filters, dimension, dimensions),
        page: 1,
      })),
    [commit, dimensions],
  );

  const active = activeDimensions(state.filters, dimensions);

  return {
    filters: state.filters,
    page: state.page,
    dialogFilterCount: active.filter(({ key }) => key !== "name").length,
    hasActiveFilters: active.length > 0,
    setFilters,
    setPage,
    clearDimension,
  };
}
