import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type ListSearchState<Filters> = { filters: Filters; page: number };

type ListSearchParamsApi<Filters extends { name?: string }> = {
  parse: (params: URLSearchParams) => ListSearchState<Filters>;
  replace: (
    current: URLSearchParams,
    state: ListSearchState<Filters>,
  ) => URLSearchParams;
  normalize: (filters: Filters) => Filters;
  without: (filters: Filters, dimension: string) => Filters;
  count: (filters: Filters, options?: { exclude?: string[] }) => number;
};

export function useListSearchParams<Filters extends { name?: string }>({
  parse,
  replace,
  normalize,
  without,
  count,
}: ListSearchParamsApi<Filters>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => parse(searchParams), [parse, searchParams]);

  const commit = useCallback(
    (
      update: (current: ListSearchState<Filters>) => ListSearchState<Filters>,
    ) => {
      setSearchParams((prev) => replace(prev, update(parse(prev))), {
        replace: true,
      });
    },
    [setSearchParams, parse, replace],
  );

  const setFilters = useCallback(
    (filters: Filters) => {
      commit(() => ({ filters: normalize(filters), page: 1 }));
    },
    [commit, normalize],
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
        filters: normalize({ ...current.filters, name: trimmed || undefined }),
        page: 1,
      }));
    },
    [commit, normalize],
  );

  const clearDimension = useCallback(
    (dimension: string) => {
      commit((current) => ({
        filters: without(current.filters, dimension),
        page: 1,
      }));
    },
    [commit, without],
  );

  return {
    filters: state.filters,
    page: state.page,
    dialogFilterCount: count(state.filters, { exclude: ["name"] }),
    hasActiveFilters: count(state.filters) > 0,
    setFilters,
    setPage,
    setName,
    clearDimension,
  };
}
