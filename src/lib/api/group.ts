import { apiUrl } from "@/config/env";
import { normalizeGroup } from "@/lib/mappers/group";
import type { PaginatedResponse } from "@/types/pagination";
import type { Group, GroupSchemaWrite, GroupWrite } from "@/types/group";

import { apiJson } from "./client";

export async function getGroupsRequest(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Group>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  const pageResult = await apiJson<PaginatedResponse<Group>>(
    apiUrl(`/training-groups?${params.toString()}`),
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  return {
    ...pageResult,
    items: pageResult.items.map(normalizeGroup),
  };
}

export async function createGroupRequest(payload: GroupWrite): Promise<Group> {
  const group = await apiJson<Group>(apiUrl("/training-groups"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeGroup(group);
}

export async function updateGroupRequest(
  id: string,
  payload: GroupWrite,
): Promise<Group> {
  const group = await apiJson<Group>(apiUrl(`/training-groups/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeGroup(group);
}

export async function deleteGroupRequest(id: string): Promise<void> {
  return apiJson<void>(apiUrl(`/training-groups/${id}`), {
    method: "DELETE",
  });
}

export async function updateGroupSchemaRequest(
  id: string,
  payload: GroupSchemaWrite,
): Promise<Group> {
  const group = await apiJson<Group>(apiUrl(`/training-groups/${id}/schema`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return normalizeGroup(group);
}
