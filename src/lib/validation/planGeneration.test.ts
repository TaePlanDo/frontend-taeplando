import { describe, expect, it } from "vitest";

import { toPlanGenerationParameters } from "@/lib/plan/buildGenerationParameters";
import { planGenerationSchema } from "./planGeneration";

describe("plan generation parameters", () => {
  it("accepts Auto without equipment", () => {
    const parsed = planGenerationSchema.parse({
      trainingGroupId: "group-1",
      participantCount: 20,
      equipmentIds: [],
      trainingTypeId: null,
    });
    expect(toPlanGenerationParameters(parsed)).toEqual({
      training_group_id: "group-1",
      participant_count: 20,
      available_equipment_ids: [],
      training_type_id: null,
    });
  });

  it("accepts both participant limits and preserves selected options in the payload", () => {
    for (const count of [1, 50]) {
      const parsed = planGenerationSchema.parse({
        trainingGroupId: "group-1",
        participantCount: count,
        equipmentIds: ["equipment-1"],
        trainingTypeId: "type-1",
      });
      expect(toPlanGenerationParameters(parsed)).toEqual({
        training_group_id: "group-1",
        participant_count: count,
        available_equipment_ids: ["equipment-1"],
        training_type_id: "type-1",
      });
    }
  });

  it("reports missing groups, invalid counts and duplicate equipment on their fields", () => {
    for (const count of [0, 51, 1.5, NaN]) {
      const result = planGenerationSchema.safeParse({
        trainingGroupId: "",
        trainingTypeId: null,
        participantCount: count,
        equipmentIds: ["same", "same"],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map(({ path }) => path[0])).toEqual(
          expect.arrayContaining([
            "trainingGroupId",
            "participantCount",
            "equipmentIds",
          ]),
        );
      }
    }
  });
});
