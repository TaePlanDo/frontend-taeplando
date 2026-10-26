import { afterEach, describe, expect, it, vi } from "vitest";

import { getEquipmentRequest } from "./catalogs";

function page(
  items: { id: string; name: string }[],
  current: number,
  total: number,
) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      items,
      page: current,
      page_size: 100,
      total: items.length,
      total_pages: total,
    }),
  };
}

describe("catalog API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads and combines every catalog page", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page([{ id: "1", name: "Pierwszy" }], 1, 2))
      .mockResolvedValueOnce(page([{ id: "2", name: "Drugi" }], 2, 2));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getEquipmentRequest()).resolves.toEqual([
      { id: "1", name: "Pierwszy" },
      { id: "2", name: "Drugi" },
    ]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/equipment?page=1&page_size=100",
      expect.anything(),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/equipment?page=2&page_size=100",
      expect.anything(),
    );
  });
});
