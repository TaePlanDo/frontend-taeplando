import { useListSearchParams } from "@/hooks/filters/useListSearchParams";
import {
  countActiveFilters,
  withoutFilterDimension,
} from "@/lib/plans/plan-list-filter-chips";
import { normalizeFilters } from "@/lib/plans/plan-list-filters";
import {
  parsePlanListSearchParams,
  replacePlanListSearchParams,
} from "@/lib/plans/plan-list-search-params";
import type { PlanListFilters } from "@/types/plan-list-filters";

export function usePlanListSearchParams() {
  return useListSearchParams<PlanListFilters>({
    parse: parsePlanListSearchParams,
    replace: replacePlanListSearchParams,
    normalize: normalizeFilters,
    without: withoutFilterDimension,
    count: countActiveFilters,
  });
}
