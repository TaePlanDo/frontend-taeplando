import {
  appendFilters,
  normalizeFilters as normalizeGeneric,
  type FilterConfig,
} from "@/lib/filters/engine";
import {
  AGE_FILTER_BOUNDS,
  DURATION_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  type PlanListFilters,
} from "@/types/plan-list-filters";

export const PLAN_FILTER_CONFIG: FilterConfig = {
  fields: [
    { key: "name", kind: "string" },
    { key: "min_age", kind: "int" },
    { key: "max_age", kind: "int" },
    { key: "min_participants", kind: "int" },
    { key: "max_participants", kind: "int" },
    { key: "min_duration", kind: "int" },
    { key: "max_duration", kind: "int" },
    { key: "equipment_ids", kind: "stringCsv" },
    { key: "training_type_ids", kind: "stringCsv" },
    { key: "training_group_ids", kind: "stringCsv" },
  ],
  ranges: [
    { minKey: "min_age", maxKey: "max_age", bounds: AGE_FILTER_BOUNDS },
    {
      minKey: "min_participants",
      maxKey: "max_participants",
      bounds: PARTICIPANTS_FILTER_BOUNDS,
    },
    {
      minKey: "min_duration",
      maxKey: "max_duration",
      bounds: DURATION_FILTER_BOUNDS,
    },
  ],
};

export function normalizeFilters(filters: PlanListFilters): PlanListFilters {
  return normalizeGeneric(filters, PLAN_FILTER_CONFIG) as PlanListFilters;
}

export function appendPlanListFilters(
  params: URLSearchParams,
  filters: PlanListFilters,
): void {
  appendFilters(params, filters, PLAN_FILTER_CONFIG);
}
