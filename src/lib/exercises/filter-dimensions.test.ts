import { describe, expect, it } from "vitest";

import {
  activeChips,
  activeDimensions,
  withoutDimension,
} from "@/lib/filters/definition";

import { exerciseFilters } from "./exercise-filter-list";

describe("filter-dimensions", () => {
  it("builds one chip per active dimension with catalog labels", () => {
    const chips = activeChips(
      {
        name: "Ap",
        min_age: 7,
        max_age: 14,
        equipment_ids: ["eq-1"],
        training_type_ids: ["type-1"],
        segment_ids: [3],
      },
      exerciseFilters,
      {
        equipment: [{ id: "eq-1", name: "Mata" }],
        trainingTypes: [{ id: "type-1", name: "Technika" }],
        segments: [{ id: 3, name: "Część główna" }],
      },
    );

    expect(chips.map((chip) => chip.name)).toEqual([
      "Nazwa: Ap",
      "Wiek: 7–14",
      "Sprzęt: Mata",
      "Kategorie: Technika",
      "Schematy: Część główna",
    ]);
  });

  it("counts active dimensions", () => {
    const filters = { name: "a", min_age: 7, equipment_ids: ["1"] };
    expect(activeDimensions({}, exerciseFilters)).toHaveLength(0);
    expect(activeDimensions(filters, exerciseFilters)).toHaveLength(3);
  });

  it("clears one filter dimension", () => {
    expect(
      withoutDimension(
        { name: "a", min_age: 7, max_age: 14, equipment_ids: ["1"] },
        "age",
        exerciseFilters,
      ),
    ).toEqual({ name: "a", equipment_ids: ["1"] });
  });

  it("counts, labels and clears planning ranges independently", () => {
    const filters = {
      min_core_load: 2,
      max_core_load: 4,
      min_physical_difficulty: 3,
    };
    expect(
      activeChips(filters, exerciseFilters, {}).map((chip) => chip.name),
    ).toEqual(["Intensywność fizyczna: 3–…", "Zaangażowanie partii core: 2–4"]);
    expect(withoutDimension(filters, "core_load", exerciseFilters)).toEqual({
      min_physical_difficulty: 3,
    });
  });
});
