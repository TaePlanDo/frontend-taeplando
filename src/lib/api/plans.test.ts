import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deletePlanExerciseRequest,
  deletePlanRequest,
  getPlanExerciseAlternativesRequest,
  getPlanRequest,
  getPlansRequest,
  replacePlanExerciseRequest,
  updatePlanNameRequest,
  updatePlanStructureRequest,
} from "./plans";

function response(status: number, body: unknown) {
  return { ok: true, status, json: async () => body };
}

describe("plans API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists plans with pagination and filters", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response(200, { items: [], total: 0, page: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await getPlansRequest(2, 6, {
      name: "kata",
      min_age: 6,
      max_age: 16,
      training_group_ids: ["8f20d653-dc8b-4b76-bdb4-b225c7d420a6"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans?name=kata&min_age=6&max_age=16&training_group_ids=8f20d653-dc8b-4b76-bdb4-b225c7d420a6&page=2&page_size=6",
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

  it("updates the plan name and returns the updated plan", async () => {
    const plan = { id: "plan-1", name: "Nowa nazwa" };
    const fetchMock = vi.fn().mockResolvedValue(response(200, plan));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updatePlanNameRequest({ planId: "plan-1", name: "Nowa nazwa" }),
    ).resolves.toEqual(plan);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/plan-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Nowa nazwa" }),
      }),
    );
  });

  it("updates the order using plan exercise ids", async () => {
    const plan = { id: "plan-1", exercises: [] };
    const fetchMock = vi.fn().mockResolvedValue(response(200, plan));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updatePlanStructureRequest({
        planId: "plan-1",
        planExerciseIds: ["slot-2", "slot-1"],
      }),
    ).resolves.toEqual(plan);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/plan-1/structure",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ plan_exercise_ids: ["slot-2", "slot-1"] }),
      }),
    );
  });

  it("fetches alternatives for a plan exercise", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, []));
    vi.stubGlobal("fetch", fetchMock);
    await getPlanExerciseAlternativesRequest("plan-1", "slot-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/plan-1/exercises/slot-1/alternatives",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("replaces and deletes a plan exercise", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    await replacePlanExerciseRequest({
      planId: "plan-1",
      planExerciseId: "slot-1",
      exerciseId: "exercise-2",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/training-plans/plan-1/exercises/slot-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ exercise_id: "exercise-2" }),
      }),
    );
    fetchMock.mockResolvedValue(response(204, undefined));
    await deletePlanExerciseRequest({
      planId: "plan-1",
      planExerciseId: "slot-1",
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/training-plans/plan-1/exercises/slot-1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
