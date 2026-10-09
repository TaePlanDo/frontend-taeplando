import { afterEach, describe, expect, it, vi } from "vitest";

import { loginRequest, refreshRequest } from "./auth";

describe("auth API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("login sends POST with credentials include", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "token",
        token_type: "bearer",
        expires_in: 900,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await loginRequest({
      email: "trainer@example.com",
      password: "password123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: "trainer@example.com",
          password: "password123",
        }),
      }),
    );
  });

  it("refresh uses POST on refresh path", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "new",
        token_type: "bearer",
        expires_in: 900,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await refreshRequest();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/refresh",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });
});
