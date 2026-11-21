import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { exerciseFilters } from "@/lib/exercises/exercise-filter-list";
import type { ExerciseListFilters } from "@/types/exercise-list-filters";
import { PLANNING_FILTERS } from "@/types/exercise-list-filters";

import { ListFiltersSheet } from "./ListFiltersSheet";

vi.mock("@/hooks/useIsMobile", () => ({ useIsMobile: () => true }));

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
  it("sets the configured status when the switch is enabled", () => {
    const onChange = vi.fn();
    renderSheet({ name: "chagi" }, { onChange });

    fireEvent.click(
      screen.getByRole("switch", { name: "Wykluczone ćwiczenia" }),
    );
    expect(onChange).toHaveBeenCalledWith({
      name: "chagi",
      status: "SUSPENDED",
    });
  });

  it("clears the configured status when the switch is disabled", () => {
    const onChange = vi.fn();
    renderSheet({ status: "SUSPENDED" }, { onChange });

    const toggle = screen.getByRole("switch", { name: "Wykluczone ćwiczenia" });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith({ status: undefined });
  });

  it("reports range and catalog changes immediately", async () => {
    const onChange = vi.fn();
    renderSheet({ name: "chagi" }, { onChange });

    fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith({
      name: "chagi",
      min_age: 2,
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

  it("uses mobile buttons for all five small ranges and commits both bounds", () => {
    const onChange = vi.fn();
    renderSheet({ name: "chagi" }, { onChange });

    for (const { label, min, max } of PLANNING_FILTERS) {
      const group = within(screen.getByRole("group", { name: label }));
      const lower = within(group.getByRole("radiogroup", { name: "Od" }));
      const upper = within(group.getByRole("radiogroup", { name: "Do" }));
      expect(lower.getAllByRole("radio")).toHaveLength(5);
      expect(upper.getAllByRole("radio")).toHaveLength(5);
      expect(lower.getByRole("radio", { name: "1" })).toBeChecked();
      expect(upper.getByRole("radio", { name: "5" })).toBeChecked();
      fireEvent.click(lower.getByRole("radio", { name: "2" }));
      expect(onChange).toHaveBeenLastCalledWith({
        name: "chagi",
        [min]: 2,
        [max]: 5,
      });
      fireEvent.click(upper.getByRole("radio", { name: "4" }));
      expect(onChange).toHaveBeenLastCalledWith({
        name: "chagi",
        [min]: 1,
        [max]: 4,
      });
    }
    expect(screen.getAllByRole("slider")).toHaveLength(4);
  });

  it("prevents inverted ranges and allows equal endpoints", () => {
    const onChange = vi.fn();
    renderSheet(
      { min_physical_difficulty: 2, max_physical_difficulty: 4 },
      { onChange },
    );
    const group = within(
      screen.getByRole("group", { name: "Intensywność fizyczna" }),
    );
    const lower = within(group.getByRole("radiogroup", { name: "Od" }));
    const upper = within(group.getByRole("radiogroup", { name: "Do" }));
    expect(lower.getByRole("radio", { name: "5" })).toBeDisabled();
    expect(upper.getByRole("radio", { name: "1" })).toBeDisabled();
    fireEvent.click(lower.getByRole("radio", { name: "4" }));
    expect(onChange).toHaveBeenCalledWith({
      min_physical_difficulty: 4,
      max_physical_difficulty: 4,
    });
  });

  it("offers a retry when catalogs fail to load", () => {
    const onRetry = vi.fn();
    renderSheet({ equipment_ids: ["removed-id"] }, { isError: true, onRetry });

    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByText("Niedostępny element (removed-id)")).toBeTruthy();
  });
});
