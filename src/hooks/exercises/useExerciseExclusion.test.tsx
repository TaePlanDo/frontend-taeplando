import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import {
  excludeExerciseRequest,
  reactivateExerciseRequest,
} from "@/lib/api/exercise";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";

import { useExerciseExclusion } from "./useExerciseExclusion";

vi.mock("@/lib/api/exercise", () => ({
  excludeExerciseRequest: vi.fn(),
  reactivateExerciseRequest: vi.fn(),
}));

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useExerciseExclusion(), { wrapper }) };
}

it("changes exclusion and invalidates exercise queries", async () => {
  const { client, result } = setup();
  const invalidate = vi.spyOn(client, "invalidateQueries");

  await act(() => result.current.setExclusion({ id: "1", excluded: true }));
  await act(() => result.current.setExclusion({ id: "1", excluded: false }));

  expect(excludeExerciseRequest).toHaveBeenCalledWith("1");
  expect(reactivateExerciseRequest).toHaveBeenCalledWith("1");
  expect(invalidate).toHaveBeenCalledTimes(2);
  expect(invalidate).toHaveBeenCalledWith({
    queryKey: queryKeys.exercises.all,
  });
});

it("reports an unavailable exercise without invalidating queries", async () => {
  vi.mocked(excludeExerciseRequest).mockRejectedValueOnce(
    new ApiError(404, "Not found"),
  );
  const { client, result } = setup();
  const invalidate = vi.spyOn(client, "invalidateQueries");

  await act(async () => {
    await expect(
      result.current.setExclusion({ id: "1", excluded: true }),
    ).rejects.toThrow("Ćwiczenie jest niedostępne");
  });
  expect(invalidate).not.toHaveBeenCalled();
});

it("leaves filtered pages for the server to recalculate after restoring", async () => {
  const { client, result } = setup();
  const allKey = [...queryKeys.exercises.lists(), {}, { page: 1, pageSize: 6 }];
  const excludedKey = [
    ...queryKeys.exercises.lists(),
    { status: "SUSPENDED" },
    { page: 1, pageSize: 6 },
  ];
  const page = {
    items: [{ id: "1", status: "SUSPENDED" }],
    total: 1,
    page: 1,
    page_size: 6,
    total_pages: 1,
  };
  client.setQueryData(allKey, page);
  client.setQueryData(excludedKey, page);

  await act(() => result.current.setExclusion({ id: "1", excluded: false }));

  expect(client.getQueryData(allKey)).toEqual({
    ...page,
    items: [{ id: "1", status: "ACTIVE" }],
  });
  expect(client.getQueryData(excludedKey)).toEqual(page);
  expect(client.getQueryState(excludedKey)?.isInvalidated).toBe(true);
});
