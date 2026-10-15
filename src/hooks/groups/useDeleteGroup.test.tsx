import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteGroupRequest } from "@/lib/api/group";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queryKeys";

import { useDeleteGroup } from "./useDeleteGroup";

vi.mock("@/lib/api/group", () => ({
  deleteGroupRequest: vi.fn(),
}));

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");

  const { result } = renderHook(() => useDeleteGroup(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });

  return { result, invalidate };
}

describe("useDeleteGroup", () => {
  beforeEach(() => {
    vi.mocked(deleteGroupRequest).mockReset();
  });

  it("deletes the group and refreshes list and details", async () => {
    vi.mocked(deleteGroupRequest).mockResolvedValue(undefined);
    const { result, invalidate } = setup();

    await act(async () => {
      await result.current.deleteGroup("1");
    });

    expect(deleteGroupRequest).toHaveBeenCalledWith("1");
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.groups.lists(),
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.groups.details(),
    });
    expect(result.current.error).toBeNull();
  });

  it.each([
    [404, "Grupa nie istnieje"],
    [500, "Nie udało się usunąć grupy. Spróbuj ponownie."],
  ])("maps status %i to a Polish message", async (status, message) => {
    vi.mocked(deleteGroupRequest).mockRejectedValue(
      new ApiError(status, "error"),
    );
    const { result, invalidate } = setup();

    await act(async () => {
      await expect(result.current.deleteGroup("1")).rejects.toThrow();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(message);
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
