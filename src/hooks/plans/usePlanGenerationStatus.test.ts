import { describe, expect, it } from "vitest";

import { generationPollIntervalMs } from "./usePlanGenerationStatus";

describe("generationPollIntervalMs", () => {
  it("polls only while queued or running", () => {
    expect(generationPollIntervalMs("QUEUED")).toBe(1500);
    expect(generationPollIntervalMs("RUNNING")).toBe(1500);
  });

  it("stops polling for terminal or missing status", () => {
    expect(generationPollIntervalMs(undefined)).toBe(false);
    expect(generationPollIntervalMs("SUCCEEDED")).toBe(false);
    expect(generationPollIntervalMs("FAILED")).toBe(false);
    expect(generationPollIntervalMs("TIMED_OUT")).toBe(false);
  });
});
