import {
  appendFilters,
  filterParamKeys,
  parseFilters,
  parsePositiveInt,
  type FilterConfig,
  type Filters,
} from "./engine";

type ListSearchState = { filters: Filters; page: number };

export function parseListSearchParams(
  params: URLSearchParams,
  config: FilterConfig,
): ListSearchState {
  const page = Math.max(1, parsePositiveInt(params.get("page")) ?? 1);
  return { page, filters: parseFilters(params, config) };
}

export function toListSearchParams(
  state: ListSearchState,
  config: FilterConfig,
): URLSearchParams {
  const params = new URLSearchParams();
  appendFilters(params, state.filters, config);
  if (state.page > 1) params.set("page", String(state.page));
  return params;
}

export function replaceListSearchParams(
  current: URLSearchParams,
  state: ListSearchState,
  config: FilterConfig,
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const key of [...filterParamKeys(config), "page"]) {
    next.delete(key);
  }
  toListSearchParams(state, config).forEach((value, key) => {
    next.set(key, value);
  });
  return next;
}
