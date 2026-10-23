import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { useEntityMutation } from "./useEntityMutation";

it("invalidates the configured query key after success", async () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(
    () =>
      useEntityMutation({
        mutationFn: async (id: string) => ({ id }),
        invalidateKey: ["items"],
        fallbackMessage: "Błąd",
      }),
    { wrapper },
  );

  await act(() => result.current.mutate("1"));
  await waitFor(() =>
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["items"] }),
  );
});
