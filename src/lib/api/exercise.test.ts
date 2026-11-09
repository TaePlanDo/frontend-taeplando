import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createExerciseRequest,
  deleteExerciseRequest,
  excludeExerciseRequest,
  getExercisesRequest,
  reactivateExerciseRequest,
  updateExerciseRequest,
} from "./exercise";
import { ApiError } from "./errors";

const payload = {
  name: "Borek",
  description: "Opis",
  image_url: null,
  min_age: 7,
  max_age: 14,
  min_participants: 1,
  max_participants: 20,
  duration_minutes: 10,
  physical_difficulty: 3,
  technical_difficulty: 3,
  upper_body_load: 3,
  lower_body_load: 3,
  core_load: 3,
  equipment_ids: [],
  training_type_ids: ["type"],
  segment_ids: [1],
};

function response(status: number, body: unknown) {
  return { ok: true, status, json: async () => body };
}

describe("exercise API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["excludes", excludeExerciseRequest, "PUT"],
    ["reactivates", reactivateExerciseRequest, "DELETE"],
  ])("%s an exercise", async (_name, request, method) => {
    const fetchMock = vi.fn().mockResolvedValue(response(204, undefined));
    vi.stubGlobal("fetch", fetchMock);

    await expect(request("id")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/exercises/id/exclusion",
      expect.objectContaining({ method }),
    );
  });

  it("gets a requested page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, { items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await getExercisesRequest(2, 6);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/exercises?page=2&page_size=6",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("appends list filters to the query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, { items: [] }));
    vi.stubGlobal("fetch", fetchMock);
    await getExercisesRequest(1, 6, {
      name: "chagi",
      min_age: 7,
      max_age: 14,
      min_core_load: 2,
      max_core_load: 4,
      equipment_ids: ["eq-1"],
      training_type_ids: ["type-1"],
      segment_ids: [3],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/exercises?name=chagi&min_age=7&max_age=14&min_core_load=2&max_core_load=4&equipment_ids=eq-1&training_type_ids=type-1&segment_ids=3&page=1&page_size=6",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it.each([
    ["creates", () => createExerciseRequest(payload), "/api/exercises", "POST"],
    [
      "updates",
      () => updateExerciseRequest("id", payload),
      "/api/exercises/id",
      "PUT",
    ],
    [
      "deletes",
      () => deleteExerciseRequest("id"),
      "/api/exercises/id",
      "DELETE",
    ],
  ])(
    "%s an exercise with the proper request",
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
        json: async () => ({ detail: "Invalid exercise" }),
      }),
    );

    await expect(createExerciseRequest(payload)).rejects.toEqual(
      new ApiError(422, "Invalid exercise"),
    );
  });
});
