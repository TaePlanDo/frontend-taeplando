import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExerciseAttributesSelector } from "./ExerciseAttributesSelector";

vi.mock("@/hooks/exercises/useExerciseCatalogs", () => ({
  useExerciseCatalogs: () => ({
    data: {
      equipment: [{ id: "e1", name: "Tarcza" }],
      trainingTypes: [{ id: "t1", name: "Technika" }],
      segments: [{ id: 1, code: "WARMUP", name: "Rozgrzewka" }],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

describe("ExerciseAttributesSelector", () => {
  it("adds a selected training type", async () => {
    const onTypeIdsChange = vi.fn();
    render(
      <ExerciseAttributesSelector
        equipmentIds={[]}
        typeIds={[]}
        segmentIds={[]}
        onEquipmentIdsChange={vi.fn()}
        onTypeIdsChange={onTypeIdsChange}
        onSegmentIdsChange={vi.fn()}
        errors={{}}
      />,
    );

    const typeTab = screen.getByRole("tab", { name: /Typ/ });
    fireEvent.mouseDown(typeTab, { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByLabelText("Dodaj typ"));
    fireEvent.click(await screen.findByRole("option", { name: "Technika" }));
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

    expect(onTypeIdsChange).toHaveBeenCalledWith(["t1"]);
  });

  it("removes a selected attribute through its badge", () => {
    const onEquipmentIdsChange = vi.fn();
    render(
      <ExerciseAttributesSelector
        equipmentIds={["e1"]}
        typeIds={[]}
        segmentIds={[]}
        onEquipmentIdsChange={onEquipmentIdsChange}
        onTypeIdsChange={vi.fn()}
        onSegmentIdsChange={vi.fn()}
        errors={{}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Usuń Tarcza" }));

    expect(onEquipmentIdsChange).toHaveBeenCalledWith([]);
  });

  it("shows selected types before the picker and keeps validation associated", () => {
    render(
      <ExerciseAttributesSelector
        equipmentIds={[]}
        typeIds={["t1"]}
        segmentIds={[]}
        onEquipmentIdsChange={vi.fn()}
        onTypeIdsChange={vi.fn()}
        onSegmentIdsChange={vi.fn()}
        errors={{ type: "Sprawdź wybrane typy" }}
      />,
    );
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Typ/ }), {
      button: 0,
      ctrlKey: false,
    });

    const selected = screen.getByRole("button", { name: "Usuń Technika" });
    const picker = screen.getByRole("combobox");
    expect(screen.getByText("Wybrane typy")).toBeTruthy();
    expect(
      selected.compareDocumentPosition(picker) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(picker).toHaveAccessibleDescription("Sprawdź wybrane typy");
    expect(picker).toHaveAttribute("aria-invalid", "true");
  });
});
