import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";
import { groupPlanPhases } from "@/lib/plan/phaseGrouping";
import { planFixture } from "@/test/planFixture";
import { PlanPhaseSection } from "./PlanPhaseSection";

vi.mock("@dnd-kit/core", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@dnd-kit/core")>()),
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: ReactNode;
    onDragEnd: (event: unknown) => void;
  }) => (
    <div>
      {children}
      <button
        onClick={() =>
          onDragEnd({ active: { id: "ex-1" }, over: { id: "ex-3" } })
        }
      >
        Zakończ przeciąganie
      </button>
      <button onClick={() => onDragEnd({ active: { id: "ex-1" }, over: null })}>
        Upuść poza listą
      </button>
    </div>
  ),
}));
vi.mock("./PlanExerciseRow", () => ({
  PlanExerciseRow: () => <div>Ćwiczenie</div>,
}));

it("only forwards a valid drop when the phase is enabled", () => {
  const onReorder = vi.fn();
  const phase = groupPlanPhases({
    ...planFixture,
    exercises: [
      ...planFixture.exercises,
      { ...planFixture.exercises[0], id: "ex-3", position: 2 },
    ],
  })[0];
  const { rerender } = render(
    <PlanPhaseSection
      phase={phase}
      onReplace={vi.fn()}
      onRemove={vi.fn()}
      onReorder={onReorder}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Upuść poza listą" }));
  expect(onReorder).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Zakończ przeciąganie" }));
  expect(onReorder).toHaveBeenCalledExactlyOnceWith("ex-1", "ex-3");
  rerender(
    <PlanPhaseSection
      phase={phase}
      disabled
      onReplace={vi.fn()}
      onRemove={vi.fn()}
      onReorder={onReorder}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Zakończ przeciąganie" }));
  expect(onReorder).toHaveBeenCalledTimes(1);
});
