import { apiUrl } from "@/config/env";
import type { PaginatedResponse } from "@/types/pagination";
import type { Group } from "@/types/group";

import { apiJson } from "./client";

// TODO: This is temporary, backend always returns all groups in declared range (I need to pass it in request)
const MIN_AGE = 0;
const MAX_AGE = 200;

export async function getGroupsRequest(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Group>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    min_age: String(MIN_AGE),
    max_age: String(MAX_AGE),
  });

  return apiJson<PaginatedResponse<Group>>(
    apiUrl(`/training-groups?${params.toString()}`),
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
}
