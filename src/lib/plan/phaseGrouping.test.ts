import { describe, expect, it } from "vitest";

import { planFixture } from "@/test/planFixture";

import {
  groupPlanPhases,
  plannedPhaseMinutes,
  sumExerciseMinutes,
  totalActualMinutes,
} from "./phaseGrouping";

describe("phaseGrouping", () => {
  it("rounds planned phase minutes from percentage", () => {
    expect(plannedPhaseMinutes(20, 90)).toBe(18);
    expect(plannedPhaseMinutes(80, 90)).toBe(72);
  });

  it("sums exercise durations", () => {
    expect(sumExerciseMinutes(planFixture.exercises)).toBe(85);
    expect(totalActualMinutes(planFixture)).toBe(85);
  });

  it("groups exercises by schema position with deltas", () => {
    const phases = groupPlanPhases(planFixture);

    expect(phases).toHaveLength(2);
    expect(phases[0]).toMatchObject({
      plannedMinutes: 18,
      actualMinutes: 15,
      deltaMinutes: -3,
    });
    expect(phases[0].exercises.map((e) => e.id)).toEqual(["ex-1"]);
    expect(phases[1]).toMatchObject({
      plannedMinutes: 72,
      actualMinutes: 70,
      deltaMinutes: -2,
    });
    expect(phases[1].exercises.map((e) => e.id)).toEqual(["ex-2"]);
  });
});
