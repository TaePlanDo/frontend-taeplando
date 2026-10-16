import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateGroupRequest } from "@/lib/api/group";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";
import type { GroupWrite } from "@/types/group";

import { useUpdateGroup } from "./useUpdateGroup";

vi.mock("@/lib/api/group", () => ({
  updateGroupRequest: vi.fn(),
}));

const payload: GroupWrite = {
  name: "Grupa",
  min_age: 7,
  max_age: 14,
  duration_minutes: 60,
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");

  const { result } = renderHook(() => useUpdateGroup(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  return { result, invalidate };
}

describe("useUpdateGroup", () => {
  beforeEach(() => {
    vi.mocked(updateGroupRequest).mockReset();
  });

  it("sends id with payload and refreshes list and details", async () => {
    vi.mocked(updateGroupRequest).mockResolvedValue({
      id: "1",
      ...payload,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const { result, invalidate } = setup();

    await act(async () => {
      await result.current.updateGroup("1", payload);
    });

    expect(updateGroupRequest).toHaveBeenCalledWith("1", payload);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.groups.lists(),
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.groups.details(),
    });
  });

  it.each([
    [404, "Grupa nie istnieje"],
    [422, "Sprawdź poprawność danych grupy"],
    [500, "Nie udało się zaktualizować grupy. Spróbuj ponownie."],
  ])("maps status %i to a Polish message", async (status, message) => {
    vi.mocked(updateGroupRequest).mockRejectedValue(
      new ApiError(status, "error"),
    );
    const { result, invalidate } = setup();

    await act(async () => {
      await expect(result.current.updateGroup("1", payload)).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(message);
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
