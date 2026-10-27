import {
  keepPreviousData,
  onlineManager,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

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

function useOnlineState() {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline(),
    () => true,
  );
}

export function usePaginatedList<TItem>({
  queryKey,
  fetchPage,
  initialPage = 1,
  pageSize = 6,
}: UsePaginatedListOptions<TItem>) {
  const [page, setPage] = useState(initialPage);
  const isOnline = useOnlineState();

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
    hasData: data !== undefined,
    isOffline: !isOnline,
    isLoading: query.isPending || query.isPlaceholderData || isPastLastPage,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    goToPage,
  };
}
