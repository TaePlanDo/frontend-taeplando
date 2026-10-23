import { apiUrl } from "@/config/env";
import type { CatalogReference, TrainingSegment } from "@/types/exercise";
import type { PaginatedResponse } from "@/types/pagination";

import { apiJson } from "./client";

async function getCatalog(path: string): Promise<CatalogReference[]> {
  const firstPage = await apiJson<PaginatedResponse<CatalogReference>>(
    apiUrl(`${path}?page=1&page_size=100`),
  );
  if (firstPage.total_pages <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.total_pages - 1 }, (_, index) =>
      apiJson<PaginatedResponse<CatalogReference>>(
        apiUrl(`${path}?page=${index + 2}&page_size=100`),
      ),
    ),
  );

  return [...firstPage.items, ...remainingPages.flatMap(({ items }) => items)];
}

export const getEquipmentRequest = () => getCatalog("/equipment");
export const getTrainingTypesRequest = () => getCatalog("/training-types");
export const getTrainingSegmentsRequest = () =>
  apiJson<TrainingSegment[]>(apiUrl("/training-segments"));
