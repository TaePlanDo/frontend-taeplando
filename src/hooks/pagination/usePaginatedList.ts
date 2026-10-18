import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";

import type { PaginatedResponse } from "@/types/pagination";

type UsePaginatedListOptions<TItem> = {
  queryKey: QueryKey;
  fetchPage: (
    page: number,
    pageSize: number,
  ) => Promise<PaginatedResponse<TItem>>;
  initialPage?: number;
  pageSize?: number;
};

export function usePaginatedList<TItem>({
  queryKey,
  fetchPage,
  initialPage = 1,
  pageSize = 20,
}: UsePaginatedListOptions<TItem>) {
  const [page, setPage] = useState(initialPage);

  const query = useQuery({
    queryKey: [...queryKey, { page, pageSize }],
    queryFn: () => fetchPage(page, pageSize),
    placeholderData: keepPreviousData,
  });

  const data = query.data;
  const totalPages = data?.total_pages ?? 1;

  const goToPage = useCallback(
    (target: number) => {
      setPage(Math.min(Math.max(target, 1), totalPages));
    },
    [totalPages],
  );

  return {
    items: data?.items ?? [],
    page,
    total: data?.total ?? 0,
    totalPages,
    isLoading: query.isLoading,
    goToPage,
  };
}
