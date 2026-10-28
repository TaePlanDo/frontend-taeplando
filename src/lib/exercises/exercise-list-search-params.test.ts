import { describe, expect, it } from "vitest";

import { normalizeFilters } from "./exercise-list-filters";
import {
  parseExerciseListSearchParams,
  toExerciseListSearchParams,
} from "./exercise-list-search-params";

describe("exercise-list-search-params", () => {
  it("round-trips filters and page", () => {
    const state = {
      page: 3,
      filters: {
        name: "chagi",
        min_age: 7,
        max_age: 14,
        min_participants: 2,
        max_participants: 20,
        equipment_ids: ["eq-1", "eq-2"],
        training_type_ids: ["type-1"],
        segment_ids: [1, 3],
      },
    };

    const params = toExerciseListSearchParams(state);
    expect(Object.fromEntries(params.entries())).toEqual({
      name: "chagi",
      min_age: "7",
      max_age: "14",
      min_participants: "2",
      max_participants: "20",
      equipment_ids: "eq-1,eq-2",
      training_type_ids: "type-1",
      segment_ids: "1,3",
      page: "3",
    });
    expect(parseExerciseListSearchParams(params)).toEqual(state);
  });

  it("omits empty filters and page 1", () => {
    const params = toExerciseListSearchParams({ filters: {}, page: 1 });
    expect([...params.keys()]).toEqual([]);
  });

  it("omits full default age and participants ranges", () => {
    const params = toExerciseListSearchParams({
      page: 1,
      filters: {
        min_age: 0,
        max_age: 99,
        min_participants: 1,
        max_participants: 99,
      },
    });
    expect([...params.keys()]).toEqual([]);
  });

  it("normalizes full default ranges away", () => {
    expect(
      normalizeFilters({
        name: " x ",
        min_age: 0,
        max_age: 99,
        min_participants: 1,
        max_participants: 99,
        equipment_ids: [],
      }),
    ).toEqual({ name: "x" });
  });
});
