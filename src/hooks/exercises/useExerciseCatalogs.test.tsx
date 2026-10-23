import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { useExerciseCatalogs } from "./useExerciseCatalogs";

vi.mock("@/lib/api/catalogs", () => ({
  getEquipmentRequest: vi.fn().mockResolvedValue([{ id: "e", name: "Tarcza" }]),
  getTrainingTypesRequest: vi
    .fn()
    .mockResolvedValue([{ id: "t", name: "Technika" }]),
  getTrainingSegmentsRequest: vi
    .fn()
    .mockResolvedValue([{ id: 1, code: "W", name: "Rozgrzewka" }]),
}));

it("loads all exercise catalogs in parallel", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useExerciseCatalogs(), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.trainingTypes[0].name).toBe("Technika");
});
