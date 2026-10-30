import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { getEquipmentPageRequest } from "@/lib/api/equipment";

import { useEquipment } from "./useEquipment";

vi.mock("@/lib/api/equipment", () => ({
  getEquipmentPageRequest: vi.fn(),
}));

it("loads the first page of equipment", async () => {
  vi.mocked(getEquipmentPageRequest).mockResolvedValue({
    items: [{ id: "equipment-1", name: "Tarcza treningowa" }],
    total: 1,
    page: 1,
    page_size: 6,
    total_pages: 1,
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useEquipment(), { wrapper });

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(getEquipmentPageRequest).toHaveBeenCalledWith(1, 6);
  expect(result.current.items).toEqual([
    { id: "equipment-1", name: "Tarcza treningowa" },
  ]);
});
