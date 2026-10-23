import { apiUrl } from "@/config/env";
import type { Exercise, ExerciseWrite } from "@/types/exercise";
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

export async function createExerciseRequest(
  payload: ExerciseWrite,
): Promise<Exercise> {
  return apiJson<Exercise>(apiUrl("/exercises"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateExerciseRequest(
  id: string,
  payload: ExerciseWrite,
): Promise<Exercise> {
  return apiJson<Exercise>(apiUrl(`/exercises/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
