import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
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

function setup(fetchPage: (page: number) => Promise<PaginatedResponse<Item>>) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return renderHook(
    () => usePaginatedList<Item>({ queryKey: ["items"], fetchPage }),
    { wrapper },
  );
}

describe("usePaginatedList", () => {
  it("loads the first page", async () => {
    const { result } = setup(async (page) => pageOf(page));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([{ id: "p1" }]);
    expect(result.current.isError).toBe(false);
    expect(result.current.listState).toEqual({ kind: "ready" });
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
});
