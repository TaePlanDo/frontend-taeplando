import { apiUrl } from "@/config/env";
import type { TrainingSegment } from "@/types/training-segment";

import { apiJson } from "./client";

export async function getTrainingSegmentsRequest(): Promise<TrainingSegment[]> {
  return apiJson<TrainingSegment[]>(apiUrl("/training-segments"), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
