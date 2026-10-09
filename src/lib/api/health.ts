import { apiUrl } from "@/config/env";

import { apiJson } from "./client";

export type HealthResponse = {
  status: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  return apiJson<HealthResponse>(apiUrl("/health"));
}
