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

  const nextPage = useCallback(() => {
    setPage((current) => Math.min(current + 1, totalPages));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setPage((current) => Math.max(current - 1, 1));
  }, []);

  return {
    items: data?.items ?? [],
    page,
    pageSize,
    total: data?.total ?? 0,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    goToPage,
    nextPage,
    previousPage,
  };
}
