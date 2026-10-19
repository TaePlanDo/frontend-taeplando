import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

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

  const isPastLastPage = data != null && page > totalPages;

  useEffect(() => {
    if (isPastLastPage) {
      setPage(totalPages);
    }
  }, [isPastLastPage, totalPages]);

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
    // True while the requested page has no data of its own: the first load,
    // a page transition (`data` is the previous page kept as placeholder, so
    // `items` must not be shown as the selected page) or a page correction.
    isLoading: query.isLoading || query.isPlaceholderData || isPastLastPage,
    isFetching: query.isFetching,
    // A failed request must not look like an empty list: `items` is `[]` here.
    isError: query.isError,
    refetch: query.refetch,
    goToPage,
  };
}
