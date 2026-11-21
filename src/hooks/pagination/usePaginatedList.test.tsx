import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { PaginatedResponse } from "@/types/pagination";

import { usePaginatedList } from "./usePaginatedList";

type Item = { id: string };

function pageOf(
  page: number,
  totalPages = 3,
  ids: string[] = [`p${page}`],
): PaginatedResponse<Item> {
  return {
    items: ids.map((id) => ({ id })),
    total: totalPages * 20,
    page,
    page_size: 20,
    total_pages: totalPages,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function setup(
  fetchPage: (
    page: number,
    pageSize: number,
  ) => Promise<PaginatedResponse<Item>>,
  initialPage = 1,
) {
  return renderHook(
    () =>
      usePaginatedList<Item>({
        queryKey: ["items"],
        fetchPage,
        initialPage,
      }),
    { wrapper: createWrapper() },
  );
}

describe("usePaginatedList", () => {
  it("loads the first page with the default page size", async () => {
    const fetchPage = vi.fn(async (page: number) => pageOf(page));
    const { result } = setup(fetchPage);

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([{ id: "p1" }]);
    expect(result.current.isError).toBe(false);
    expect(result.current.listState).toEqual({ kind: "ready" });
    expect(fetchPage).toHaveBeenCalledWith(1, 20);
  });

  it("reports a failed request as an error, not as an empty list", async () => {
    const { result } = setup(() => Promise.reject(new Error("boom")));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.listState).toEqual({
      kind: "unavailable",
      reason: "error",
    });
  });

  it("does not report an error for a real empty result", async () => {
    const { result } = setup(async (page) => pageOf(page, 1, []));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(20);
    expect(result.current.listState).toEqual({ kind: "empty" });
  });

  it("recovers after a retry of a failed request", async () => {
    const fetchPage = vi
      .fn<(page: number) => Promise<PaginatedResponse<Item>>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(pageOf(1));
    const { result } = setup(fetchPage);

    await waitFor(() => expect(result.current.isError).toBe(true));

    act(() => {
      void result.current.refetch();
    });

    await waitFor(() => expect(result.current.isError).toBe(false));
    expect(result.current.items).toEqual([{ id: "p1" }]);
  });

  it("keeps cached data and pagination state after a refresh fails", async () => {
    const fetchPage = vi
      .fn<(page: number) => Promise<PaginatedResponse<Item>>>()
      .mockResolvedValueOnce(pageOf(1))
      .mockRejectedValueOnce(new Error("boom"));
    const { result } = setup(fetchPage);

    await waitFor(() =>
      expect(result.current.listState).toEqual({ kind: "ready" }),
    );

    act(() => {
      void result.current.refetch();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.items).toEqual([{ id: "p1" }]);
    expect(result.current.listState).toEqual({
      kind: "stale",
      reason: "error",
      isEmpty: false,
    });
  });

  it("does not present the previous page as loaded while the next page is fetching", async () => {
    const next = deferred<PaginatedResponse<Item>>();
    const { result } = setup((page) =>
      page === 1 ? Promise.resolve(pageOf(1)) : next.promise,
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.goToPage(2));

    expect(result.current.page).toBe(2);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.totalPages).toBe(3);

    next.resolve(pageOf(2));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.page).toBe(2);
    expect(result.current.items).toEqual([{ id: "p2" }]);
  });

  it.each([
    [0, 1, 2],
    [4, 3, 1],
  ])(
    "clamps requested page %i to %i",
    async (targetPage, expectedPage, initialPage) => {
      const { result } = setup(async (page) => pageOf(page), initialPage);
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.goToPage(targetPage));

      await waitFor(() => expect(result.current.page).toBe(expectedPage));
    },
  );

  it("does not report a page change when the requested page is already active", async () => {
    const onPageChange = vi.fn();
    const { result } = renderHook(
      () =>
        usePaginatedList<Item>({
          queryKey: ["controlled-items"],
          fetchPage: async (page) => pageOf(page),
          page: 1,
          onPageChange,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.goToPage(1));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("moves to the last page when the selected one no longer exists", async () => {
    let totalPages = 3;
    const { result } = setup(async (page) =>
      page > totalPages
        ? pageOf(page, totalPages, [])
        : pageOf(page, totalPages),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.goToPage(3));
    await waitFor(() => expect(result.current.items).toEqual([{ id: "p3" }]));

    totalPages = 2;
    act(() => {
      void result.current.refetch();
    });

    await waitFor(() => expect(result.current.page).toBe(2));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([{ id: "p2" }]);
  });

  it("reports past-last-page clamps through onPageChange when controlled", async () => {
    let totalPages = 3;

    const { result } = renderHook(
      () => {
        const [page, setPage] = useState(3);
        return usePaginatedList<Item>({
          queryKey: ["controlled-items"],
          fetchPage: async (current) =>
            current > totalPages
              ? pageOf(current, totalPages, [])
              : pageOf(current, totalPages),
          page,
          onPageChange: setPage,
        });
      },
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.page).toBe(3);

    totalPages = 2;
    act(() => {
      void result.current.refetch();
    });

    await waitFor(() => expect(result.current.page).toBe(2));
  });
});
