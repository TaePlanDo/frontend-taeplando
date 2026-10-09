import { afterEach, describe, expect, it, vi } from "vitest";

import { setAccessToken } from "@/auth/tokenRef";

import { apiFetch, setRefreshHandler } from "./client";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setAccessToken(null);
    setRefreshHandler(null);
  });

  it("retries once after 401 when refresh succeeds", async () => {
    setAccessToken("old-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({ status: 200, ok: true });
    vi.stubGlobal("fetch", fetchMock);

    setRefreshHandler(async () => {
      setAccessToken("new-token");
      return "new-token";
    });

    const response = await apiFetch("/api/auth/me");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]?.headers?.get("Authorization")).toBe(
      "Bearer new-token",
    );
  });
});
