import { apiUrl } from "@/config/env";
import { appendFilters } from "@/lib/filters/definition";
import { planFilters } from "@/lib/plans/plan-filter-list";
import type { PlanListFilters } from "@/types/plan-list-filters";
import type { PlanDetail, PlanListItem } from "@/types/plan";
import type { PaginatedResponse } from "@/types/pagination";

import { apiJson } from "./client";

export function getPlansRequest(
  page: number,
  pageSize: number,
  filters: PlanListFilters = {},
): Promise<PaginatedResponse<PlanListItem>> {
  const params = new URLSearchParams();
  appendFilters(params, filters, planFilters);
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  return apiJson<PaginatedResponse<PlanListItem>>(
    apiUrl(`/training-plans?${params.toString()}`),
    { method: "GET" },
  );
}

export function getPlanRequest(planId: string): Promise<PlanDetail> {
  return apiJson<PlanDetail>(apiUrl(`/training-plans/${planId}`), {
    method: "GET",
  });
}

export function deletePlanRequest(planId: string): Promise<void> {
  return apiJson<void>(apiUrl(`/training-plans/${planId}`), {
    method: "DELETE",
  });
}
