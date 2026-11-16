import { describe, expect, it } from "vitest";

import { planFixture } from "@/test/planFixture";

import {
  groupPlanPhases,
  allocatePhaseMinutes,
  sumExerciseMinutes,
  totalActualMinutes,
} from "./phaseGrouping";

describe("phaseGrouping", () => {
  it("allocates whole minutes using the largest remainders and position as a tie breaker", () => {
    const schema = [20, 20, 50, 10].map((percentage, index) => ({
      position: index + 1,
      segment_id: index + 1,
      code: "",
      name: "",
      percentage,
    }));
    expect([...allocatePhaseMinutes(schema, 45).values()]).toEqual([
      9, 9, 23, 4,
    ]);
    const tied = [33.33, 33.33, 33.34].map((percentage, index) => ({
      position: index + 1,
      segment_id: index + 1,
      code: "",
      name: "",
      percentage,
    }));
    expect([...allocatePhaseMinutes(tied, 7).values()]).toEqual([2, 2, 3]);
    expect(
      [...allocatePhaseMinutes([...schema].reverse(), 45).entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, minutes]) => minutes),
    ).toEqual([9, 9, 23, 4]);
  });

  it("sums exercise durations", () => {
    expect(sumExerciseMinutes(planFixture.exercises)).toBe(85);
    expect(totalActualMinutes(planFixture)).toBe(85);
  });

  it("does not show a false deficit when the allocated segment times total 45 minutes", () => {
    const schema = [20, 20, 50, 10].map((percentage, index) => ({
      position: index + 1,
      segment_id: index + 1,
      code: "",
      name: "",
      percentage,
    }));
    const exercises = [9, 9, 23, 4].map((minutes, index) => ({
      ...planFixture.exercises[0],
      id: `exercise-${index}`,
      schema_position: index + 1,
      duration_minutes_snapshot: minutes,
    }));
    const phases = groupPlanPhases({
      ...planFixture,
      training_duration_snapshot: 45,
      schema_snapshot: schema,
      exercises,
    });
    expect(phases.map((phase) => phase.deltaMinutes)).toEqual([0, 0, 0, 0]);
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
