import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { planFixture } from "@/test/planFixture";
import type { PlanExerciseAlternative } from "@/types/plan";
import { PlanExerciseAlternativesSheet } from "./PlanExerciseAlternativesSheet";

const query = vi.hoisted(() => ({
  data: undefined as PlanExerciseAlternative[] | undefined,
  isPending: false,
  isError: false,
  isFetching: false,
  refetch: vi.fn(),
}));
vi.mock("@/hooks/plans/usePlanExerciseAlternatives", () => ({
  usePlanExerciseAlternatives: () => query,
}));
vi.mock("@/hooks/useOnlineState", () => ({ useOnlineState: () => true }));

const alternative: PlanExerciseAlternative = {
  trainer_exercise_id: "trainer-2",
  exercise_id: "exercise-2",
  name: "Kopnięcia",
  image_url: null,
  physical_difficulty: 3,
  technical_difficulty: 2,
  upper_body_load: 1,
  lower_body_load: 4,
  core_load: 2,
  equipment: [],
  training_types: [],
  similarity_score: 0.89,
};

function renderSheet(onReplace = vi.fn()) {
  render(
    <PlanExerciseAlternativesSheet
      planId="plan-1"
      exercise={planFixture.exercises[0]}
      number={1}
      open
      onOpenChange={vi.fn()}
      onReplace={onReplace}
    />,
  );
  return onReplace;
}

describe("PlanExerciseAlternativesSheet", () => {
  beforeEach(() => {
    query.data = undefined;
    query.isPending = false;
    query.isError = false;
    query.isFetching = false;
    query.refetch.mockReset();
  });

  it("shows loading and empty states", () => {
    query.isPending = true;
    const { rerender } = render(
      <PlanExerciseAlternativesSheet
        planId="plan-1"
        exercise={planFixture.exercises[0]}
        number={1}
        open
        onOpenChange={vi.fn()}
        onReplace={vi.fn()}
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    query.isPending = false;
    query.data = [];
    rerender(
      <PlanExerciseAlternativesSheet
        planId="plan-1"
        exercise={planFixture.exercises[0]}
        number={1}
        open
        onOpenChange={vi.fn()}
        onReplace={vi.fn()}
      />,
    );
    expect(screen.getByText("Brak ćwiczeń zamiennych")).toBeInTheDocument();
  });

  it("offers a retry when fetching fails", () => {
    query.isError = true;
    renderSheet();
    expect(
      screen.getByText("Nie udało się pobrać ćwiczeń zamiennych"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(query.refetch).toHaveBeenCalledOnce();
  });

  it("submits only a selected alternative", () => {
    query.data = [alternative];
    const onReplace = renderSheet();
    const submit = screen.getByRole("button", { name: "Wymień ćwiczenie" });
    expect(submit).toBeDisabled();
    expect(screen.getByLabelText("Podobieństwo 89%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Wybierz Kopnięcia" }));
    fireEvent.click(submit);
    expect(onReplace).toHaveBeenCalledWith("exercise-2");
  });
});
