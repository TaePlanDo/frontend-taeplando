import type { PlanListFilters } from "@/types/plan-list-filters";

import {
  appendPlanListFilters,
  parsePlanListFilters,
  parsePositiveInt,
  PLAN_LIST_FILTER_PARAM_KEYS,
} from "./plan-list-filters";

export type PlanListSearchState = {
  filters: PlanListFilters;
  page: number;
};

export function parsePlanListSearchParams(
  params: URLSearchParams,
): PlanListSearchState {
  const page = Math.max(1, parsePositiveInt(params.get("page")) ?? 1);
  return {
    page,
    filters: parsePlanListFilters(params),
  };
}

export function toPlanListSearchParams({
  filters,
  page,
}: PlanListSearchState): URLSearchParams {
  const params = new URLSearchParams();
  appendPlanListFilters(params, filters);
  if (page > 1) params.set("page", String(page));
  return params;
}

export function replacePlanListSearchParams(
  current: URLSearchParams,
  state: PlanListSearchState,
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const key of [...PLAN_LIST_FILTER_PARAM_KEYS, "page"]) {
    next.delete(key);
  }
  toPlanListSearchParams(state).forEach((value, key) => {
    next.set(key, value);
  });
  return next;
}
