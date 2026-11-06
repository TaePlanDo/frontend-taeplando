import { describe, expect, it } from "vitest";

import type { PlanGenerationStatus } from "@/types/plan";

import {
  deriveGenerationView,
  isPlanGenerationInProgress,
} from "./generationView";

function job(
  overrides: Partial<PlanGenerationStatus> &
    Pick<PlanGenerationStatus, "status">,
): PlanGenerationStatus {
  return {
    id: "job-1",
    plan_id: null,
    error_code: null,
    error_message: null,
    ...overrides,
  };
}

describe("isPlanGenerationInProgress", () => {
  it("is true only for queued and running jobs", () => {
    expect(isPlanGenerationInProgress("QUEUED")).toBe(true);
    expect(isPlanGenerationInProgress("RUNNING")).toBe(true);
    expect(isPlanGenerationInProgress("SUCCEEDED")).toBe(false);
    expect(isPlanGenerationInProgress(undefined)).toBe(false);
  });
});

describe("deriveGenerationView", () => {
  it("returns loading while fetching or in progress", () => {
    expect(deriveGenerationView(null, true, false)).toEqual({
      kind: "loading",
    });
    expect(
      deriveGenerationView(job({ status: "QUEUED" }), false, false),
    ).toEqual({ kind: "loading" });
    expect(
      deriveGenerationView(job({ status: "RUNNING" }), false, false),
    ).toEqual({ kind: "loading" });
  });

  it("returns ready with plan id on success", () => {
    expect(
      deriveGenerationView(
        job({ status: "SUCCEEDED", plan_id: "plan-1" }),
        false,
        false,
      ),
    ).toEqual({ kind: "ready", planId: "plan-1" });
  });

  it("treats success without plan id as error", () => {
    expect(
      deriveGenerationView(
        job({ status: "SUCCEEDED", plan_id: null }),
        false,
        false,
      ),
    ).toMatchObject({
      kind: "error",
      title: "Generowanie nie powiodło się",
    });
  });

  it("returns error with backend message on failure", () => {
    expect(
      deriveGenerationView(
        job({
          status: "FAILED",
          error_message: "Brak pasujących ćwiczeń",
        }),
        false,
        false,
      ),
    ).toEqual({
      kind: "error",
      title: "Generowanie nie powiodło się",
      message: "Brak pasujących ćwiczeń",
    });
  });

  it("returns error on fetch failure", () => {
    expect(deriveGenerationView(null, false, true)).toEqual({
      kind: "error",
      message: "Nie udało się pobrać statusu generowania planu.",
    });
  });
});
