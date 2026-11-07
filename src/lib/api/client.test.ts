import { afterEach, describe, expect, it, vi } from "vitest";

import { setAccessToken } from "@/auth/tokenRef";

import { apiFetch, setOnAuthLost } from "./client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
    setOnAuthLost(null);
  });

  it("retries once after 401 when refresh succeeds", async () => {
    setAccessToken("old-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: "new-token",
          token_type: "bearer",
          expires_in: 900,
        }),
      })
      .mockResolvedValueOnce({ status: 200, ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const response = await apiFetch("/api/auth/me");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/auth/refresh");
    expect(fetchMock.mock.calls[2]?.[1]?.headers?.get("Authorization")).toBe(
      "Bearer new-token",
    );
  });

  it("shares one refresh across concurrent 401s", async () => {
    setAccessToken("old-token");
    let refreshCalls = 0;
    const fetchMock = vi.fn().mockImplementation(async (path: string) => {
      if (path === "/api/auth/refresh") {
        refreshCalls += 1;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            access_token: "new-token",
            token_type: "bearer",
            expires_in: 900,
          }),
        };
      }
      if (refreshCalls === 0) {
        return { status: 401, ok: false };
      }
      return { status: 200, ok: true };
    });
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      apiFetch("/api/equipment"),
      apiFetch("/api/training-groups"),
    ]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(refreshCalls).toBe(1);
  });

  it("clears session via onAuthLost when refresh fails", async () => {
    setAccessToken("old-token");
    const onAuthLost = vi.fn();
    setOnAuthLost(onAuthLost);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "expired" }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const response = await apiFetch("/api/auth/me");

    expect(response.status).toBe(401);
    expect(onAuthLost).toHaveBeenCalledTimes(1);
  });
});
