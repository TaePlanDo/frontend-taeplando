import type { PaginatedResponse } from "@/types/pagination";

export async function getAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
): Promise<T[]> {
  const pageSize = 100;
  const firstPage = await fetchPage(1, pageSize);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.total_pages - 1) }, (_, index) =>
      fetchPage(index + 2, pageSize),
    ),
  );

  return [...firstPage.items, ...remainingPages.flatMap(({ items }) => items)];
}
