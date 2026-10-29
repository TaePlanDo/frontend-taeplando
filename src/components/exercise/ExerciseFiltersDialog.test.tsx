import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExerciseFiltersDialog } from "./ExerciseFiltersDialog";

vi.mock("@/hooks/exercises/useExerciseCatalogs", () => ({
  useExerciseCatalogs: () => ({
    data: {
      equipment: [{ id: "eq-1", name: "Mata" }],
      trainingTypes: [{ id: "type-1", name: "Technika" }],
      segments: [{ id: 3, code: "MAIN", name: "Część główna" }],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe("ExerciseFiltersDialog", () => {
  it("applies draft catalog and range filters", async () => {
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

    fireEvent.click(screen.getByRole("button", { name: "Zastosuj filtry" }));
    expect(onApply).toHaveBeenCalledWith({ name: "chagi" });
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
});
