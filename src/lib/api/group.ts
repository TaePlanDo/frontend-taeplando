import { apiUrl } from "@/config/env";
import type { PaginatedResponse } from "@/types/pagination";
import type { Group, GroupWrite } from "@/types/group";

import { apiJson } from "./client";

export async function getGroupsRequest(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Group>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  return apiJson<PaginatedResponse<Group>>(
    apiUrl(`/training-groups?${params.toString()}`),
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
}

export async function createGroupRequest(payload: GroupWrite): Promise<Group> {
  return apiJson<Group>(apiUrl("/training-groups"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateGroupRequest(
  id: string,
  payload: GroupWrite,
): Promise<Group> {
  return apiJson<Group>(apiUrl(`/training-groups/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteGroupRequest(id: string): Promise<void> {
  return apiJson<void>(apiUrl(`/training-groups/${id}`), {
    method: "DELETE",
  });
}
