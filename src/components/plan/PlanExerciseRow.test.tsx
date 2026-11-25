import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { planFixture } from "@/test/planFixture";
import { PlanExerciseRow } from "./PlanExerciseRow";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: { x: 0, y: 50, scaleX: 1, scaleY: 2 },
    transition: undefined,
    isDragging: true,
  }),
}));

it("moves a dragged row without scaling it to another row's height", () => {
  render(
    <PlanExerciseRow
      exercise={planFixture.exercises[0]}
      number={1}
      onReplace={vi.fn()}
      onRemove={vi.fn()}
      canReorder
    />,
  );
  const row = screen.getByRole("button", {
    name: "Przenieś ćwiczenie Bieg",
  }).parentElement;
  expect(row?.style.transform).toBe("translate3d(0px, 50px, 0)");
});
