import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";

import {
  getEquipmentRequest,
  getTrainingTypesRequest,
} from "@/lib/api/catalogs";
import { getAllGroupsRequest } from "@/lib/api/group";
import { queryKeys } from "@/lib/queryKeys";
import { usePlanGenerationOptions } from "./usePlanGenerationOptions";

vi.mock("@/lib/api/catalogs", () => ({
  getEquipmentRequest: vi.fn(),
  getTrainingTypesRequest: vi.fn(),
}));
vi.mock("@/lib/api/group", () => ({ getAllGroupsRequest: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getAllGroupsRequest).mockResolvedValue([]);
  vi.mocked(getEquipmentRequest).mockResolvedValue([
    { id: "e", name: "Tarcza" },
  ]);
  vi.mocked(getTrainingTypesRequest).mockResolvedValue([
    { id: "t", name: "Technika" },
  ]);
});

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    client,
    ...renderHook(() => usePlanGenerationOptions(), { wrapper }),
  };
}

it("loads options and refreshes them after group or equipment invalidation", async () => {
  const { result, client } = setup();
  await waitFor(() =>
    expect(result.current.trainingTypes.status).toBe("ready"),
  );
  expect(result.current.groups.items).toEqual([]);
  expect(result.current.state.kind).toBe("empty");
  expect(result.current.equipment.items[0].name).toBe("Tarcza");
  expect(result.current.trainingTypes.items[0].name).toBe("Technika");
  await act(async () => {
    await client.invalidateQueries({ queryKey: queryKeys.groups.all });
    await client.invalidateQueries({ queryKey: queryKeys.equipment.all });
  });
  expect(getAllGroupsRequest).toHaveBeenCalledTimes(2);
  expect(getEquipmentRequest).toHaveBeenCalledTimes(2);
  expect(getTrainingTypesRequest).toHaveBeenCalledTimes(1);
});

it("exposes a failed request for inline feedback and allows retry without losing other catalogs", async () => {
  vi.mocked(getEquipmentRequest).mockRejectedValueOnce(new Error("Offline"));
  const { result } = setup();
  await waitFor(() =>
    expect(result.current.state).toEqual({
      kind: "error",
      message: "Nie udało się pobrać sprzętu.",
      retrying: false,
    }),
  );
  expect(result.current.equipment.status).toBe("error");
  expect(result.current.trainingTypes.items[0].name).toBe("Technika");
  await act(async () => {
    await result.current.retry();
  });
  await waitFor(() => expect(result.current.equipment.status).toBe("ready"));
  expect(result.current.equipment.items[0].name).toBe("Tarcza");
  expect(getTrainingTypesRequest).toHaveBeenCalledTimes(1);
});
