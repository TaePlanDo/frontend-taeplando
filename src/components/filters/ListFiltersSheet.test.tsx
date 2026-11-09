import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { exerciseFilters } from "@/lib/exercises/exercise-filter-list";
import type { ExerciseListFilters } from "@/types/exercise-list-filters";

import { ListFiltersSheet } from "./ListFiltersSheet";

const catalogs = {
  equipment: [{ id: "eq-1", name: "Mata" }],
  trainingTypes: [{ id: "type-1", name: "Technika" }],
  segments: [{ id: 3, name: "Część główna" }],
};

function renderSheet(
  filters: ExerciseListFilters,
  props: {
    onChange?: () => void;
    isError?: boolean;
    onRetry?: () => void;
  } = {},
) {
  render(
    <ListFiltersSheet
      title="Filtry ćwiczeń"
      buttonLabel="Filtruj"
      filterCount={0}
      filters={filters}
      onChange={props.onChange ?? vi.fn()}
      dimensions={exerciseFilters}
      catalogs={catalogs}
      isError={props.isError}
      onRetry={props.onRetry ?? vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Filtruj" }));
}

describe("ListFiltersSheet", () => {
  it("reports range and catalog changes immediately", async () => {
    const onChange = vi.fn();
    renderSheet({ name: "chagi" }, { onChange });

    fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith({
      name: "chagi",
      min_age: 1,
      max_age: 99,
    });

    fireEvent.click(screen.getByRole("combobox", { name: "Sprzęt" }));
    fireEvent.click(await screen.findByRole("option", { name: "Mata" }));
    expect(onChange).toHaveBeenLastCalledWith({
      name: "chagi",
      equipment_ids: ["eq-1"],
    });
  });

  it("clears the filters but keeps the name", () => {
    const onChange = vi.fn();
    renderSheet(
      { name: "chagi", min_age: 7, max_age: 14, equipment_ids: ["eq-1"] },
      { onChange },
    );

    fireEvent.click(screen.getByRole("button", { name: "Wyczyść" }));
    expect(onChange).toHaveBeenCalledWith({ name: "chagi" });
  });

  it("offers a retry when catalogs fail to load", () => {
    const onRetry = vi.fn();
    renderSheet({ equipment_ids: ["removed-id"] }, { isError: true, onRetry });

    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByText("Niedostępny element (removed-id)")).toBeTruthy();
  });
});
