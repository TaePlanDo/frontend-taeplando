import { apiUrl } from "@/config/env";
import type { PlanDetail, PlanListItem } from "@/types/plan";
import type { PaginatedResponse } from "@/types/pagination";

import { apiJson } from "./client";

export function getPlansRequest(
  page: number,
  pageSize: number,
  name = "",
): Promise<PaginatedResponse<PlanListItem>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  const trimmed = name.trim();
  if (trimmed) params.set("name", trimmed);

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
