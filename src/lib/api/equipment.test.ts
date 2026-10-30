import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createEquipmentRequest,
  deleteEquipmentRequest,
  getEquipmentPageRequest,
  updateEquipmentRequest,
} from "./equipment";
import { ApiError } from "./errors";

const payload = { name: "Tarcza treningowa" };

function response(status: number, body: unknown) {
  return { ok: true, status, json: async () => body };
}

describe("equipment API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("gets a requested page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, { items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await getEquipmentPageRequest(2, 6);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/equipment?page=2&page_size=6",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it.each([
    [
      "creates",
      () => createEquipmentRequest(payload),
      "/api/equipment",
      "POST",
    ],
    [
      "updates",
      () => updateEquipmentRequest("id", payload),
      "/api/equipment/id",
      "PUT",
    ],
    [
      "deletes",
      () => deleteEquipmentRequest("id"),
      "/api/equipment/id",
      "DELETE",
    ],
  ])(
    "%s equipment with the proper request",
    async (_name, request, url, method) => {
      const fetchMock = vi.fn().mockResolvedValue(response(200, {}));
      vi.stubGlobal("fetch", fetchMock);

      await request();

      expect(fetchMock).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          method,
          ...(method !== "DELETE" ? { body: JSON.stringify(payload) } : {}),
        }),
      );
    },
  );

  it("surfaces the backend error with its status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
        json: async () => ({ detail: "Invalid equipment" }),
      }),
    );

    await expect(createEquipmentRequest(payload)).rejects.toEqual(
      new ApiError(422, "Invalid equipment"),
    );
  });
});
