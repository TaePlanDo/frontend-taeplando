import {
  parseListSearchParams,
  replaceListSearchParams,
  toListSearchParams,
} from "@/lib/filters/search-params";
import type { PlanListFilters } from "@/types/plan-list-filters";

import { PLAN_FILTER_CONFIG } from "./plan-list-filters";

export type PlanListSearchState = {
  filters: PlanListFilters;
  page: number;
};

export function parsePlanListSearchParams(
  params: URLSearchParams,
): PlanListSearchState {
  return parseListSearchParams(
    params,
    PLAN_FILTER_CONFIG,
  ) as PlanListSearchState;
}

export function toPlanListSearchParams(
  state: PlanListSearchState,
): URLSearchParams {
  return toListSearchParams(state, PLAN_FILTER_CONFIG);
}

export function replacePlanListSearchParams(
  current: URLSearchParams,
  state: PlanListSearchState,
): URLSearchParams {
  return replaceListSearchParams(current, state, PLAN_FILTER_CONFIG);
}
