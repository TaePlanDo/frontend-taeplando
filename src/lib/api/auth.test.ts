import { afterEach, describe, expect, it, vi } from "vitest";

import { loginRequest, refreshRequest, registerRequest } from "./auth";

import { ApiError } from "./errors";

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

  it("register sends credentials and returns token", async () => {
    const tokens = {
      access_token: "token",
      token_type: "bearer",
      expires_in: 900,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => tokens,
    });
    vi.stubGlobal("fetch", fetchMock);

    const credentials = {
      email: "trainer@example.com",
      password: "Trening123!",
    };
    const result = await registerRequest(credentials);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify(credentials),
      }),
    );
    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;

    expect(new Headers(requestOptions.headers).get("Content-Type")).toBe(
      "application/json",
    );

    expect(result).toEqual(tokens);
  });

  it("register rejects with ApiError when email is already registered", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        detail: "Email already registered",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const request = registerRequest({
      email: "trainer@example.com",
      password: "Trening123!",
    });

    await expect(request).rejects.toBeInstanceOf(ApiError);

    await expect(request).rejects.toMatchObject({
      status: 409,
      message: "Email already registered",
    });
  });
});
