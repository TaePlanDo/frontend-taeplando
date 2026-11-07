import { apiUrl } from "@/config/env";
import type { PlanDetail } from "@/types/plan";

import { apiJson } from "./client";

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
