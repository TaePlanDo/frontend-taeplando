import { describe, expect, it } from "vitest";

import {
  parsePlanGenerationDraft,
  serializePlanGenerationDraft,
} from "./planGenerationDraft";

describe("planGenerationDraft", () => {
  it("round-trips form values through the query string", () => {
    const values = {
      trainingGroupId: "group-1",
      participantCount: 12,
      equipmentIds: ["eq-1", "eq-2"],
      trainingTypeId: "type-1",
    };

    expect(
      parsePlanGenerationDraft(serializePlanGenerationDraft(values)),
    ).toEqual(values);
  });

  it("omits empty equipment and Auto training type", () => {
    expect(
      serializePlanGenerationDraft({
        trainingGroupId: "group-1",
        participantCount: 20,
        equipmentIds: [],
        trainingTypeId: null,
      }),
    ).toBe("?group=group-1&participants=20");
  });

  it("falls back to defaults for missing or invalid participants", () => {
    expect(parsePlanGenerationDraft("")).toEqual({
      trainingGroupId: "",
      participantCount: 20,
      equipmentIds: [],
      trainingTypeId: null,
    });
    expect(
      parsePlanGenerationDraft("?group=g1&participants=999").participantCount,
    ).toBe(20);
  });
});
