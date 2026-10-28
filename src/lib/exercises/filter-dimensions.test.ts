import { describe, expect, it } from "vitest";

import {
  buildActiveFilterChips,
  countActiveFilters,
  withoutFilterDimension,
} from "./filter-dimensions";

describe("filter-dimensions", () => {
  it("builds one chip per active dimension with catalog labels", () => {
    const chips = buildActiveFilterChips(
      {
        name: "Ap",
        min_age: 7,
        max_age: 14,
        equipment_ids: ["eq-1"],
        training_type_ids: ["type-1"],
        segment_ids: [3],
      },
      {
        equipment: [{ id: "eq-1", name: "Mata" }],
        trainingTypes: [{ id: "type-1", name: "Technika" }],
        segments: [{ id: 3, name: "Część główna" }],
      },
    );

    expect(chips.map((chip) => chip.label)).toEqual([
      "Nazwa: Ap",
      "Wiek: 7–14",
      "Sprzęt: Mata",
      "Kategorie: Technika",
      "Schematy: Część główna",
    ]);
  });

  it("counts active filter dimensions with optional exclusions", () => {
    const filters = {
      name: "a",
      min_age: 7,
      equipment_ids: ["1"],
      segment_ids: [3],
    };
    expect(countActiveFilters({})).toBe(0);
    expect(countActiveFilters(filters)).toBe(4);
    expect(countActiveFilters(filters, { exclude: ["name"] })).toBe(3);
  });

  it("clears one filter dimension", () => {
    expect(
      withoutFilterDimension(
        { name: "a", min_age: 7, max_age: 14, equipment_ids: ["1"] },
        "age",
      ),
    ).toEqual({ name: "a", equipment_ids: ["1"] });
  });
});
