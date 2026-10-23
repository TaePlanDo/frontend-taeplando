import { apiUrl } from "@/config/env";
import type { Exercise } from "@/types/exercise";
import type { PaginatedResponse } from "@/types/pagination";

import { apiJson } from "./client";

export async function getExercisesRequest(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Exercise>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  return apiJson<PaginatedResponse<Exercise>>(
    apiUrl(`/exercises?${params.toString()}`),
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function deleteExerciseRequest(id: string): Promise<void> {
  return apiJson<void>(apiUrl(`/exercises/${id}`), {
    method: "DELETE",
  });
}
