import { apiUrl } from "@/config/env";
import type { CatalogReference, TrainingSegment } from "@/types/exercise";
import type { PaginatedResponse } from "@/types/pagination";

import { apiJson } from "./client";
import { getAllPages } from "./all-pages";

async function getCatalog(path: string): Promise<CatalogReference[]> {
  return getAllPages((page, pageSize) =>
    apiJson<PaginatedResponse<CatalogReference>>(
      apiUrl(`${path}?page=${page}&page_size=${pageSize}`),
    ),
  );
}

export const getEquipmentRequest = () => getCatalog("/equipment");
export const getTrainingTypesRequest = () => getCatalog("/training-types");
export const getTrainingSegmentsRequest = () =>
  apiJson<TrainingSegment[]>(apiUrl("/training-segments"));
