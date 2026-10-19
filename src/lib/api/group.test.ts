import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createGroupRequest,
  deleteGroupRequest,
  getGroupsRequest,
  updateGroupRequest,
} from "./group";

import { ApiError } from "./errors";

const payload = {
  name: "Grupa",
  min_age: 7,
  max_age: 14,
  duration_minutes: 60,
};

function okResponse(status: number, body: unknown) {
  return { ok: true, status, json: async () => body };
}

describe("group API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gets a page of groups with the age range", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse(200, {
        items: [],
        total: 0,
        page: 2,
        page_size: 10,
        total_pages: 1,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getGroupsRequest(2, 10);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-groups?page=2&page_size=10",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("creates a group with POST", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse(201, { id: "1", ...payload }));
    vi.stubGlobal("fetch", fetchMock);

    const group = await createGroupRequest(payload);

    expect(group).toEqual({ id: "1", ...payload });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-groups",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("updates a group with PUT on its id", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse(200, { id: "abc", ...payload }));
    vi.stubGlobal("fetch", fetchMock);

    await updateGroupRequest("abc", payload);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-groups/abc",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("deletes a group with DELETE on its id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => undefined,
    });
    vi.stubGlobal("fetch", fetchMock);

    await deleteGroupRequest("abc");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-groups/abc",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("throws ApiError with status when the backend rejects the group", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ detail: "Group not found" }),
      }),
    );

    await expect(updateGroupRequest("abc", payload)).rejects.toEqual(
      new ApiError(404, "Group not found"),
    );
  });
});
