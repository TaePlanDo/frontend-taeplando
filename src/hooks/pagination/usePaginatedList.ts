import {
  keepPreviousData,
  onlineManager,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import type { PaginatedResponse } from "@/types/pagination";
import { getPaginatedListState } from "./listState";

type PaginatedListBaseOptions<TItem> = {
  queryKey: QueryKey;
  fetchPage: (
    page: number,
    pageSize: number,
  ) => Promise<PaginatedResponse<TItem>>;
  pageSize?: number;
};

type ControlledPagination = {
  page: number;
  onPageChange: (page: number) => void;
};

type UncontrolledPagination = {
  initialPage?: number;
  page?: never;
  onPageChange?: never;
};

export type UsePaginatedListOptions<TItem> = PaginatedListBaseOptions<TItem> &
  (ControlledPagination | UncontrolledPagination);

function isControlledPagination<TItem>(
  options: UsePaginatedListOptions<TItem>,
): options is PaginatedListBaseOptions<TItem> & ControlledPagination {
  return options.page !== undefined;
}

function useOnlineState() {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline(),
    () => true,
  );
}

export function usePaginatedList<TItem>(
  options: UsePaginatedListOptions<TItem>,
) {
  const { queryKey, fetchPage, pageSize = 6 } = options;
  const [uncontrolledPage, setUncontrolledPage] = useState(
    "initialPage" in options ? (options.initialPage ?? 1) : 1,
  );
  const controlledPagination = isControlledPagination(options);
  const onPageChange = controlledPagination ? options.onPageChange : undefined;
  const page = controlledPagination ? options.page : uncontrolledPage;
  const isOnline = useOnlineState();

  const setPage = useCallback(
    (next: number) => {
      if (onPageChange) {
        onPageChange(next);
      } else {
        setUncontrolledPage(next);
      }
    },
    [onPageChange],
  );

  const query = useQuery({
    queryKey: [...queryKey, { page, pageSize }],
    queryFn: () => fetchPage(page, pageSize),
    placeholderData: keepPreviousData,
  });

  const data = query.data;
  const totalPages = data?.total_pages ?? 1;

  const isPastLastPage = data != null && page > totalPages;
  const hasData = data !== undefined;
  const isLoading =
    query.isPending || query.isPlaceholderData || isPastLastPage;
  const isEmpty = data?.items.length === 0;

  const listState = getPaginatedListState({
    hasData,
    isOnline,
    isLoading,
    isError: query.isError,
    isEmpty,
  });

  useEffect(() => {
    if (isPastLastPage) {
      setPage(totalPages);
    }
  }, [isPastLastPage, totalPages, setPage]);

  const goToPage = useCallback(
    (target: number) => {
      setPage(Math.min(Math.max(target, 1), totalPages));
    },
    [setPage, totalPages],
  );

  return {
    items: data?.items ?? [],
    page,
    total: data?.total ?? 0,
    totalPages,
    hasData,
    isOffline: !isOnline,
    isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    listState,
    refetch: query.refetch,
    goToPage,
  };
}
