import { describe, expect, it } from "vitest";

import { planFixture } from "@/test/planFixture";

import { buildGenerationParametersFromPlan } from "./buildGenerationParameters";

const plan = {
  ...planFixture,
  available_equipment_snapshot: [
    { id: "eq-1", name: "Tarcza" },
    { id: "eq-2", name: "Worek" },
  ],
  training_types_snapshot: [
    { id: "tt-1", name: "Kumite" },
    { id: "tt-2", name: "Kata" },
  ],
};

describe("buildGenerationParametersFromPlan", () => {
  it("rebuilds POST params from plan snapshots", () => {
    expect(buildGenerationParametersFromPlan(plan, 12)).toEqual({
      training_group_id: "group-1",
      participant_count: 12,
      available_equipment_ids: ["eq-1", "eq-2"],
      training_type_id: "tt-1",
    });
  });

  it("uses null training_type_id when snapshot is empty", () => {
    expect(
      buildGenerationParametersFromPlan(
        { ...plan, training_types_snapshot: [] },
        8,
      ),
    ).toMatchObject({ training_type_id: null, participant_count: 8 });
  });
});
