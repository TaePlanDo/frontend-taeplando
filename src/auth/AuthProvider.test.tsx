import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/hooks/useAuth";

import { AuthProvider } from "./AuthProvider";
import { getAccessToken, setAccessToken } from "./tokenRef";

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

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    statusText: status === 401 ? "Unauthorized" : "OK",
  };
}

describe("AuthProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
  });

  it("sets Polish loginError when login returns 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(401, { detail: "Invalid or expired refresh token" }),
      )
      .mockResolvedValueOnce(
        jsonResponse(401, { detail: "Invalid credentials" }),
      );
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
      expect(result.current.status).toBe("unauthenticated");
      expect(result.current.loginError).toBe("Nieprawidłowy email lub hasło");
    });
  });

  it("restores session from refresh cookie when there is no access token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          access_token: "access-token",
          token_type: "bearer",
          expires_in: 900,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          id: "1",
          email: "trainer@example.com",
          full_name: "Trainer",
          auth_method: "LOCAL",
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
      expect(result.current.user?.email).toBe("trainer@example.com");
    });
  });

  it("stays unauthenticated when refresh fails on load", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(401, { detail: "Invalid or expired refresh token" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
      expect(result.current.user).toBeNull();
    });
  });

  it("authenticates the user after successful registration", async () => {
    const user = {
      id: "1",
      email: "trainer@example.com",
      full_name: null,
      auth_method: "LOCAL",
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(401, {
          detail: "Invalid or expired refresh token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          access_token: "register-token",
          token_type: "bearer",
          expires_in: 900,
        }),
      )
      .mockResolvedValueOnce(jsonResponse(200, user));

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    await result.current.register({
      email: "trainer@example.com",
      password: "Trening123!",
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
      expect(result.current.registerError).toBeNull();
    });

    expect(getAccessToken()).toBe("register-token");

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/auth/me",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const meOptions = fetchMock.mock.calls[2][1] as RequestInit;

    expect(new Headers(meOptions.headers).get("Authorization")).toBe(
      "Bearer register-token",
    );
  });

  it("sets Polish registerError when registration returns 409", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(401, {
          detail: "Invalid or expired refresh token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(409, {
          detail: "Email already registered",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    await expect(
      result.current.register({
        email: "trainer@example.com",
        password: "Trening123!",
      }),
    ).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.registerError).toBe(
        "Użytkownik o podanym emailu już istnieje",
      );
      expect(result.current.status).toBe("unauthenticated");
      expect(result.current.user).toBeNull();
      expect(result.current.isRegistering).toBe(false);
    });

    expect(getAccessToken()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
