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
  it("adds a selected training type", () => {
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

    fireEvent.click(screen.getByRole("button", { name: /Typ/ }));
    fireEvent.change(screen.getByLabelText("Dodaj typ"), {
      target: { value: "t1" },
    });

    expect(onTypeIdsChange).toHaveBeenCalledWith(["t1"]);
  });
});
