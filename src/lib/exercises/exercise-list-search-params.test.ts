import { describe, expect, it } from "vitest";

import {
  normalizeFilters,
  parseListSearchParams,
  replaceListSearchParams,
  toListSearchParams,
} from "@/lib/filters/definition";

import { exerciseFilters } from "./exercise-filter-list";

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
        min_physical_difficulty: 2,
        max_physical_difficulty: 4,
        min_technical_difficulty: 3,
        max_upper_body_load: 4,
        min_lower_body_load: 2,
        max_core_load: 3,
        equipment_ids: [
          "8f20d653-dc8b-4b76-bdb4-b225c7d420a6",
          "de318877-45d8-4b56-b1c4-5ddaa5caa46a",
        ],
        training_type_ids: ["0b83db1d-f555-44f0-ac0b-6d1b93a4d368"],
        segment_ids: [1, 3],
      },
    };

    const params = toListSearchParams(state, exerciseFilters);
    expect(params.get("segment_ids")).toBe("1,3");
    expect(parseListSearchParams(params, exerciseFilters)).toEqual(state);
  });

  it("drops empty values, default ranges and duplicates", () => {
    expect(
      normalizeFilters(
        {
          name: " x ",
          min_age: 1,
          max_age: 99,
          min_participants: 1,
          max_participants: 99,
          equipment_ids: [],
          segment_ids: [3, 3],
        },
        exerciseFilters,
      ),
    ).toEqual({ name: "x", segment_ids: [3] });
    expect([
      ...toListSearchParams({ filters: {}, page: 1 }, exerciseFilters).keys(),
    ]).toEqual([]);
  });

  it("drops out-of-range and inverted ranges", () => {
    expect(
      normalizeFilters(
        {
          min_age: 0,
          max_age: 14,
          min_core_load: 5,
          max_core_load: 2,
          min_upper_body_load: 0,
          max_upper_body_load: 4,
        },
        exerciseFilters,
      ),
    ).toEqual({ max_age: 14, max_upper_body_load: 4 });
  });

  it("keeps unrelated query parameters when replacing state", () => {
    const current = new URLSearchParams("utm_source=a&page=3&name=old");
    const next = replaceListSearchParams(
      current,
      { page: 1, filters: { name: "new" } },
      exerciseFilters,
    );
    expect(Object.fromEntries(next)).toEqual({ utm_source: "a", name: "new" });
  });
});
