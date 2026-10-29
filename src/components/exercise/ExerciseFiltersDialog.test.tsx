import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseFiltersDialog } from "./ExerciseFiltersDialog";

const useExerciseCatalogsMock = vi.fn();

vi.mock("@/hooks/exercises/useExerciseCatalogs", () => ({
  useExerciseCatalogs: () => useExerciseCatalogsMock(),
}));

const catalogData = {
  data: {
    equipment: [{ id: "eq-1", name: "Mata" }],
    trainingTypes: [{ id: "type-1", name: "Technika" }],
    segments: [{ id: 3, code: "MAIN", name: "Część główna" }],
  },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
};

describe("ExerciseFiltersDialog", () => {
  beforeEach(() => {
    useExerciseCatalogsMock.mockReturnValue(catalogData);
  });

  it("applies changed range and catalog filters", async () => {
    const onApply = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ExerciseFiltersDialog
        open
        onOpenChange={onOpenChange}
        filters={{ name: "chagi" }}
        onApply={onApply}
        trigger={<button type="button">Filtruj</button>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Filtry ćwiczeń" }),
    ).toBeTruthy();

    const sliders = screen.getAllByRole("slider");
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    fireEvent.keyDown(sliders[2], { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("combobox", { name: "Sprzęt" }));
    fireEvent.click(await screen.findByRole("option", { name: "Mata" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Kategorie" }));
    fireEvent.click(await screen.findByRole("option", { name: "Technika" }));
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
      training_type_ids: ["type-1"],
      segment_ids: [3],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("clears the draft without writing filters", () => {
    const onApply = vi.fn();
    render(
      <ExerciseFiltersDialog
        open
        onOpenChange={vi.fn()}
        filters={{
          name: "chagi",
          min_age: 7,
          max_age: 14,
          equipment_ids: ["eq-1"],
        }}
        onApply={onApply}
        trigger={<button type="button">Filtruj</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Wyczyść" }));
    fireEvent.click(screen.getByRole("button", { name: "Zastosuj filtry" }));
    expect(onApply).toHaveBeenCalledWith({ name: "chagi" });
  });

  it("shows a retry action instead of an empty catalog message on failure", () => {
    const refetch = vi.fn();
    useExerciseCatalogsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    render(
      <ExerciseFiltersDialog
        open
        onOpenChange={vi.fn()}
        filters={{ equipment_ids: ["removed-id"] }}
        onApply={vi.fn()}
        trigger={<button type="button">Filtruj</button>}
      />,
    );

    expect(
      screen.getByText("Nie udało się pobrać dostępnych filtrów."),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(refetch).toHaveBeenCalledOnce();
    expect(screen.getByText("Niedostępny element (removed-id)")).toBeTruthy();
  });
});
