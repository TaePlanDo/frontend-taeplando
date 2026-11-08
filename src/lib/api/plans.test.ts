import { afterEach, describe, expect, it, vi } from "vitest";

import { deletePlanRequest, getPlanRequest, getPlansRequest } from "./plans";

function response(status: number, body: unknown) {
  return { ok: true, status, json: async () => body };
}

describe("plans API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists plans with pagination and optional name", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response(200, { items: [], total: 0, page: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await getPlansRequest(2, 6, "kata");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans?page=2&page_size=6&name=kata",
      expect.objectContaining({ method: "GET" }),
    );
  });

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

  it("deletes a plan by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => undefined,
    });
    vi.stubGlobal("fetch", fetchMock);

    await deletePlanRequest("plan-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/plan-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
