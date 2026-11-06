import { afterEach, describe, expect, it, vi } from "vitest";

import { getPlanRequest } from "./plans";

function response(status: number, body: unknown) {
  return { ok: true, status, json: async () => body };
}

describe("plans API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("gets a plan by id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response(200, { id: "plan-1", exercises: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await getPlanRequest("plan-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/plan-1",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
