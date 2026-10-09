import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/hooks/useAuth";

import { AuthProvider } from "./AuthProvider";

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe("AuthProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets invalidCredentials when login returns 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Invalid or expired refresh token" }),
        statusText: "Unauthorized",
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Invalid credentials" }),
        statusText: "Unauthorized",
      });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    await expect(
      result.current.login({
        email: "trainer@example.com",
        password: "password123",
      }),
    ).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.errorCode).toBe("invalidCredentials");
    });
  });
});
