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
  props: { onApply?: () => void; isError?: boolean; onRetry?: () => void } = {},
) {
  render(
    <ListFiltersSheet
      title="Filtry ćwiczeń"
      buttonLabel="Filtruj"
      filterCount={0}
      filters={filters}
      onApply={props.onApply ?? vi.fn()}
      dimensions={exerciseFilters}
      catalogs={catalogs}
      isError={props.isError}
      onRetry={props.onRetry ?? vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Filtruj" }));
}

describe("ListFiltersSheet", () => {
  it("applies changed range and catalog filters", async () => {
    const onApply = vi.fn();
    renderSheet({ name: "chagi" }, { onApply });

    const sliders = screen.getAllByRole("slider");
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    fireEvent.keyDown(sliders[2], { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("combobox", { name: "Sprzęt" }));
    fireEvent.click(await screen.findByRole("option", { name: "Mata" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Schematy" }));
    fireEvent.click(
      await screen.findByRole("option", { name: "Część główna" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Zastosuj filtry" }));

    expect(onApply).toHaveBeenCalledWith({
      name: "chagi",
      min_age: 1,
      max_age: 99,
      min_participants: 2,
      max_participants: 99,
      equipment_ids: ["eq-1"],
      segment_ids: [3],
    });
  });

  it("clears the draft but keeps the name", () => {
    const onApply = vi.fn();
    renderSheet(
      { name: "chagi", min_age: 7, max_age: 14, equipment_ids: ["eq-1"] },
      { onApply },
    );

    fireEvent.click(screen.getByRole("button", { name: "Wyczyść" }));
    fireEvent.click(screen.getByRole("button", { name: "Zastosuj filtry" }));
    expect(onApply).toHaveBeenCalledWith({ name: "chagi" });
  });

  it("offers a retry when catalogs fail to load", () => {
    const onRetry = vi.fn();
    renderSheet({ equipment_ids: ["removed-id"] }, { isError: true, onRetry });

    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByText("Niedostępny element (removed-id)")).toBeTruthy();
  });
});
