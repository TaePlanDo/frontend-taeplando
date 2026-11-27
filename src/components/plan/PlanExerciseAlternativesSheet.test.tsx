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
const viewport = vi.hoisted(() => ({ desktop: false }));
const appearance = vi.hoisted(() => ({ theme: "dark" as "dark" | "light" }));
vi.mock("@/hooks/useTheme", () => ({ useTheme: () => appearance }));
vi.mock("@/hooks/useIsDesktop", () => ({
  useIsDesktop: () => viewport.desktop,
}));
vi.mock("@/hooks/plans/usePlanExerciseAlternatives", () => ({
  usePlanExerciseAlternatives: () => query,
}));

const alternative: PlanExerciseAlternative = {
  trainer_exercise_id: "trainer-2",
  exercise_id: "exercise-2",
  name: "Kopnięcia",
  image_url: null,
  image_url_light: null,
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
    viewport.desktop = false;
    appearance.theme = "dark";
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

  it("uses the current theme for both the source and alternative thumbnails", () => {
    query.data = [
      {
        ...alternative,
        image_url: "alternative-dark.webp",
        image_url_light: "alternative-light.webp",
      },
    ];
    const props = {
      planId: "plan-1",
      exercise: {
        ...planFixture.exercises[0],
        image_url_snapshot: "source-dark.webp",
        image_url_light_snapshot: "source-light.webp",
      },
      number: 1,
      open: true,
      onOpenChange: vi.fn(),
      onReplace: vi.fn(),
    };
    const { rerender } = render(<PlanExerciseAlternativesSheet {...props} />);
    expect(
      document.querySelector('img[src="source-dark.webp"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('img[src="alternative-dark.webp"]'),
    ).toBeInTheDocument();
    appearance.theme = "light";
    rerender(<PlanExerciseAlternativesSheet {...props} />);
    expect(
      document.querySelector('img[src="source-light.webp"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('img[src="alternative-light.webp"]'),
    ).toBeInTheDocument();
  });

  it("uses a modal overlay with a wider panel on desktop", () => {
    viewport.desktop = true;
    query.data = [];
    renderSheet();
    const dialog = screen.getByRole("dialog", { name: "Wymień ćwiczenie" });
    expect(dialog).toHaveStyle({ width: "min(100%, 480px)" });
    expect(
      document.querySelector('[data-slot="sheet-overlay"]'),
    ).not.toHaveClass("lg:hidden");
  });
});
