import { afterEach, describe, expect, it, vi } from "vitest";

import { getTrainingSegmentsRequest } from "./training-segments";

describe("training segments API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gets the catalog with GET", async () => {
    const body = [
      { id: 1, code: "WARMUP", name: "Rozgrzewka" },
      { id: 3, code: "MAIN", name: "Część główna" },
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => body,
    });
    vi.stubGlobal("fetch", fetchMock);

    const segments = await getTrainingSegmentsRequest();

    expect(segments).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-segments",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
