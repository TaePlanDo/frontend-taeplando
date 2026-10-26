import { apiUrl } from "@/config/env";
import type { Equipment, EquipmentWrite } from "@/types/equipment";
import type { PaginatedResponse } from "@/types/pagination";

import { apiJson } from "./client";

export async function getEquipmentRequest(
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Equipment>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  return apiJson<PaginatedResponse<Equipment>>(
    apiUrl(`/equipment?${params.toString()}`),
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
}

export function createEquipmentRequest(
  payload: EquipmentWrite,
): Promise<Equipment> {
  return apiJson<Equipment>(apiUrl("/equipment"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateEquipmentRequest(
  id: string,
  payload: EquipmentWrite,
): Promise<Equipment> {
  return apiJson<Equipment>(apiUrl(`/equipment/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteEquipmentRequest(id: string): Promise<void> {
  return apiJson<void>(apiUrl(`/equipment/${id}`), {
    method: "DELETE",
  });
}
