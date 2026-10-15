import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGroupsRequest } from "@/lib/api/group";
import type { Group } from "@/types/group";

import { useGroups } from "./useGroups";

vi.mock("@/lib/api/group", () => ({
  getGroupsRequest: vi.fn(),
}));

const group: Group = {
  id: "1",
  name: "Młodzież",
  min_age: 7,
  max_age: 14,
  duration_minutes: 60,
  created_at: new Date("2026-10-11T12:00:00Z"),
  updated_at: new Date("2026-10-11T12:00:00Z"),
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const { result } = renderHook(() => useGroups(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  return { result };
}

describe("useGroups", () => {
  beforeEach(() => {
    vi.mocked(getGroupsRequest).mockReset();
  });

  it("loads the first page of groups", async () => {
    vi.mocked(getGroupsRequest).mockResolvedValue({
      items: [group],
      total: 1,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getGroupsRequest).toHaveBeenCalledWith(1, 20);
    expect(result.current.items).toEqual([group]);
    expect(result.current.total).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.isError).toBe(false);
  });

  it("refetches the target page after goToPage", async () => {
    vi.mocked(getGroupsRequest).mockResolvedValue({
      items: [],
      total: 25,
      page: 1,
      page_size: 20,
      total_pages: 2,
    });
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(getGroupsRequest).mockResolvedValue({
      items: [group],
      total: 25,
      page: 2,
      page_size: 20,
      total_pages: 2,
    });

    act(() => {
      result.current.goToPage(2);
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
      expect(result.current.items).toEqual([group]);
    });

    expect(getGroupsRequest).toHaveBeenLastCalledWith(2, 20);
  });

  it("clamps goToPage to the last page", async () => {
    vi.mocked(getGroupsRequest).mockResolvedValue({
      items: [],
      total: 25,
      page: 1,
      page_size: 20,
      total_pages: 2,
    });
    const { result } = setup();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.goToPage(99);
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });
  });
});
