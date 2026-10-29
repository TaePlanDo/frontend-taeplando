import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import type { PaginatedResponse } from "@/types/pagination";

type UsePaginatedListBase<TItem> = {
  queryKey: QueryKey;
  fetchPage: (
    page: number,
    pageSize: number,
  ) => Promise<PaginatedResponse<TItem>>;
  pageSize?: number;
};

type ControlledPage = {
  page: number;
  onPageChange: (page: number) => void;
  initialPage?: never;
};

type UncontrolledPage = {
  page?: undefined;
  onPageChange?: undefined;
  initialPage?: number;
};

export type UsePaginatedListOptions<TItem> = UsePaginatedListBase<TItem> &
  (ControlledPage | UncontrolledPage);

export function usePaginatedList<TItem>(
  options: UsePaginatedListOptions<TItem>,
) {
  const { queryKey, fetchPage, pageSize = 6 } = options;
  const isControlled = options.page != null;
  const onPageChange = isControlled ? options.onPageChange : undefined;
  const [uncontrolledPage, setUncontrolledPage] = useState(() =>
    isControlled ? 1 : (options.initialPage ?? 1),
  );
  const page = isControlled ? options.page : uncontrolledPage;

  const setPage = useCallback(
    (next: number) => {
      if (onPageChange) {
        onPageChange(next);
        return;
      }
      setUncontrolledPage(next);
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
    isLoading: query.isLoading || query.isPlaceholderData || isPastLastPage,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    goToPage,
  };
}
