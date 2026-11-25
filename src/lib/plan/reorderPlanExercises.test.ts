import { describe, expect, it } from "vitest";
import { planFixture } from "@/test/planFixture";
import { reorderPlanExercises } from "./reorderPlanExercises";

describe("reorderPlanExercises", () => {
  const plan = {
    ...planFixture,
    exercises: [
      { ...planFixture.exercises[0], position: 1 },
      { ...planFixture.exercises[1], position: 2 },
      { ...planFixture.exercises[0], id: "ex-3", position: 3 },
    ],
  };

  it("reorders within a phase while preserving the full schema sequence", () => {
    const result = reorderPlanExercises(plan, "ex-1", "ex-3");
    expect(
      result?.exercises.map(({ id, position, schema_position }) => [
        id,
        position,
        schema_position,
      ]),
    ).toEqual([
      ["ex-3", 1, 1],
      ["ex-2", 2, 2],
      ["ex-1", 3, 1],
    ]);
    expect(plan.exercises.map((exercise) => exercise.id)).toEqual([
      "ex-1",
      "ex-2",
      "ex-3",
    ]);
  });

  it("ignores moves across phases, to the same slot, or with missing ids", () => {
    expect(reorderPlanExercises(plan, "ex-1", "ex-2")).toBeNull();
    expect(reorderPlanExercises(plan, "ex-1", "ex-1")).toBeNull();
    expect(reorderPlanExercises(plan, "ex-1", "missing")).toBeNull();
  });
});
