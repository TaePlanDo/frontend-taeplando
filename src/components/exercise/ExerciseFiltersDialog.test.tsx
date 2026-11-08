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
      min_age: 2,
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
          min_core_load: 2,
          max_core_load: 4,
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

  it("preserves planning filters when applying the current dialog", () => {
    const onApply = vi.fn();
    render(
      <ExerciseFiltersDialog
        open
        onOpenChange={vi.fn()}
        filters={{ min_core_load: 2, max_core_load: 4 }}
        onApply={onApply}
        trigger={<button type="button">Filtruj</button>}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Zastosuj filtry" }));
    expect(onApply).toHaveBeenCalledWith({
      min_core_load: 2,
      max_core_load: 4,
    });
  });

  it("applies both bounds of a planning slider", () => {
    const onApply = vi.fn();
    render(
      <ExerciseFiltersDialog
        open
        onOpenChange={vi.fn()}
        filters={{}}
        onApply={onApply}
        trigger={<button type="button">Filtruj</button>}
      />,
    );
    const sliders = screen.getAllByRole("slider", {
      name: "Intensywność fizyczna",
    });
    sliders[0].focus();
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    sliders[1].focus();
    fireEvent.keyDown(sliders[1], { key: "ArrowLeft" });
    fireEvent.click(screen.getByRole("button", { name: "Zastosuj filtry" }));
    expect(onApply).toHaveBeenCalledWith({
      min_physical_difficulty: 2,
      max_physical_difficulty: 4,
    });
  });

  it("restores applied planning ranges when reopened", () => {
    const props = {
      onOpenChange: vi.fn(),
      filters: { min_core_load: 2, max_core_load: 4 },
      onApply: vi.fn(),
      trigger: <button type="button">Filtruj</button>,
    };
    const { rerender } = render(<ExerciseFiltersDialog {...props} open />);
    let sliders = screen.getAllByRole("slider", {
      name: "Zaangażowanie partii core",
    });
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    rerender(<ExerciseFiltersDialog {...props} open={false} />);
    rerender(<ExerciseFiltersDialog {...props} open />);
    sliders = screen.getAllByRole("slider", {
      name: "Zaangażowanie partii core",
    });
    expect(sliders[0].getAttribute("aria-valuenow")).toBe("2");
    expect(sliders[1].getAttribute("aria-valuenow")).toBe("4");
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
