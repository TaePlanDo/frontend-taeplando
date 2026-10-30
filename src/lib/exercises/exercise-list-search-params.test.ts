import { describe, expect, it } from "vitest";

import { normalizeFilters } from "./exercise-list-filters";
import {
  parseExerciseListSearchParams,
  replaceExerciseListSearchParams,
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
        equipment_ids: [
          "8f20d653-dc8b-4b76-bdb4-b225c7d420a6",
          "de318877-45d8-4b56-b1c4-5ddaa5caa46a",
        ],
        training_type_ids: ["0b83db1d-f555-44f0-ac0b-6d1b93a4d368"],
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
      equipment_ids:
        "8f20d653-dc8b-4b76-bdb4-b225c7d420a6,de318877-45d8-4b56-b1c4-5ddaa5caa46a",
      training_type_ids: "0b83db1d-f555-44f0-ac0b-6d1b93a4d368",
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

  it("canonicalizes duplicate catalog ids", () => {
    expect(
      normalizeFilters({
        equipment_ids: ["equipment-1", "equipment-1"],
        training_type_ids: ["type-1", "type-1"],
        segment_ids: [3, 3],
      }),
    ).toEqual({
      equipment_ids: ["equipment-1"],
      training_type_ids: ["type-1"],
      segment_ids: [3],
    });
  });

  it("drops malformed URL filters before they can reach the API or dialog", () => {
    const params = new URLSearchParams({
      min_age: "15",
      max_age: "14",
      min_participants: "0",
      max_participants: "20",
      equipment_ids: "not-a-uuid,8f20d653-dc8b-4b76-bdb4-b225c7d420a6",
    });

    expect(parseExerciseListSearchParams(params)).toEqual({
      page: 1,
      filters: {
        max_participants: 20,
        equipment_ids: ["8f20d653-dc8b-4b76-bdb4-b225c7d420a6"],
      },
    });
  });

  it("accepts UUIDs regardless of their version", () => {
    const params = new URLSearchParams({
      equipment_ids: "0191fb4c-6ef4-7cc1-9ac1-f78e9d6ef910",
    });

    expect(parseExerciseListSearchParams(params).filters).toEqual({
      equipment_ids: ["0191fb4c-6ef4-7cc1-9ac1-f78e9d6ef910"],
    });
  });

  it("replaces list state without removing unrelated query parameters", () => {
    const current = new URLSearchParams(
      "utm_source=newsletter&page=3&name=old",
    );

    expect(
      Object.fromEntries(
        replaceExerciseListSearchParams(current, {
          page: 1,
          filters: { name: "new" },
        }),
      ),
    ).toEqual({ utm_source: "newsletter", name: "new" });
  });
});
