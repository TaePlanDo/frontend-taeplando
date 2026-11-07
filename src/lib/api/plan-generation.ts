import { apiUrl } from "@/config/env";
import type {
  PlanGenerationAccepted,
  PlanGenerationParameters,
  PlanGenerationStatus,
} from "@/types/plan";

import { apiJson } from "./client";

export function startPlanGenerationRequest(
  parameters: PlanGenerationParameters,
): Promise<PlanGenerationAccepted> {
  return apiJson<PlanGenerationAccepted>(
    apiUrl("/plan-generation/parameters"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parameters),
    },
  );
}

export function getPlanGenerationStatusRequest(
  jobId: string,
): Promise<PlanGenerationStatus> {
  return apiJson<PlanGenerationStatus>(apiUrl(`/plan-generation/${jobId}`), {
    method: "GET",
  });
}
