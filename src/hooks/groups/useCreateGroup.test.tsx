import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createGroupRequest } from "@/lib/api/group";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";
import type { GroupWrite } from "@/types/group";

import { useCreateGroup } from "./useCreateGroup";

vi.mock("@/lib/api/group", () => ({
  createGroupRequest: vi.fn(),
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

  const { result } = renderHook(() => useCreateGroup(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  return { result, invalidate };
}

describe("useCreateGroup", () => {
  beforeEach(() => {
    vi.mocked(createGroupRequest).mockReset();
  });

  it("sends the payload and refreshes the group list", async () => {
    vi.mocked(createGroupRequest).mockResolvedValue({
      id: "1",
      ...payload,
      created_at: new Date(),
      updated_at: new Date(),
    });
    const { result, invalidate } = setup();

    await act(async () => {
      await result.current.createGroup(payload);
    });

    expect(vi.mocked(createGroupRequest).mock.calls[0][0]).toEqual(payload);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.groups.lists(),
    });
    expect(result.current.error).toBeNull();
  });

  it("returns a validation message for 422", async () => {
    vi.mocked(createGroupRequest).mockRejectedValue(
      new ApiError(422, "Unprocessable"),
    );
    const { result, invalidate } = setup();

    await act(async () => {
      await expect(result.current.createGroup(payload)).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Sprawdź poprawność danych grupy");
    });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("returns a generic message for other errors", async () => {
    vi.mocked(createGroupRequest).mockRejectedValue(
      new ApiError(500, "Server error"),
    );
    const { result } = setup();

    await act(async () => {
      await expect(result.current.createGroup(payload)).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Nie udało się utworzyć grupy. Spróbuj ponownie.",
      );
    });
  });
});
