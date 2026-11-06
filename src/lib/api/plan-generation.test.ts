import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getPlanGenerationStatusRequest,
  startPlanGenerationRequest,
} from "./plan-generation";

function response(status: number, body: unknown) {
  return { ok: true, status, json: async () => body };
}

const parameters = {
  training_group_id: "group-1",
  participant_count: 10,
  available_equipment_ids: ["eq-1"],
  training_type_id: "tt-1",
};

describe("plan-generation API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("starts generation with parameters", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(response(202, { id: "job-1", status: "QUEUED" }));
    vi.stubGlobal("fetch", fetchMock);

    await startPlanGenerationRequest(parameters);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/plan-generation/parameters",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(parameters),
      }),
    );
  });

  it("gets generation status by job id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      response(200, {
        id: "job-1",
        status: "RUNNING",
        plan_id: null,
        error_code: null,
        error_message: null,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await getPlanGenerationStatusRequest("job-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/plan-generation/job-1",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
