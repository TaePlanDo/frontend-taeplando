import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, it, vi } from "vitest";

import {
  getPlanExerciseAlternativesRequest,
  getPlanRequest,
  replacePlanExerciseRequest,
} from "@/lib/api/plans";
import { planFixture } from "@/test/planFixture";
import type { PlanDetail } from "@/types/plan";
import { PlanDetailPage } from "./PlanDetailPage";

vi.mock("@/lib/api/plans", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/plans")>()),
  getPlanRequest: vi.fn(),
  getPlanExerciseAlternativesRequest: vi.fn(),
  replacePlanExerciseRequest: vi.fn(),
}));

it("replaces an exercise and displays the refreshed plan", async () => {
  const replacement = {
    ...planFixture.exercises[0],
    exercise_id: "replacement",
    name_snapshot: "Kopnięcia",
  };
  const updatedPlan = {
    ...planFixture,
    exercises: [replacement, ...planFixture.exercises.slice(1)],
  };
  let finishRefresh!: (plan: PlanDetail) => void;
  const refresh = new Promise<PlanDetail>((resolve) => {
    finishRefresh = resolve;
  });
  vi.mocked(getPlanRequest)
    .mockResolvedValueOnce(planFixture)
    .mockReturnValueOnce(refresh);
  vi.mocked(getPlanExerciseAlternativesRequest).mockResolvedValue([
    {
      exercise_id: "replacement",
      trainer_exercise_id: "trainer-replacement",
      name: "Kopnięcia",
      image_url: null,
      physical_difficulty: 2,
      technical_difficulty: 2,
      lower_body_load: 2,
      upper_body_load: 2,
      core_load: 2,
      equipment: [],
      training_types: [],
      similarity_score: 0.9,
    },
  ]);
  vi.mocked(replacePlanExerciseRequest).mockResolvedValue(replacement);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/plans/plan-1"]}>
        <Routes>
          <Route path="/plans/:planId" element={<PlanDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(
    await screen.findByRole("button", { name: "Wymień ćwiczenie Bieg" }),
  );
  fireEvent.click(
    await screen.findByRole("radio", { name: "Wybierz Kopnięcia" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Wymień ćwiczenie" }));

  await waitFor(() =>
    expect(replacePlanExerciseRequest).toHaveBeenCalledWith({
      planId: "plan-1",
      planExerciseId: "ex-1",
      exerciseId: "replacement",
    }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Odświeżanie planu",
  );
  expect(
    screen.getByRole("button", { name: "Wymień ćwiczenie Bieg" }),
  ).toBeDisabled();

  await act(async () => finishRefresh(updatedPlan));
  expect(
    await screen.findByRole("button", { name: "Podgląd ćwiczenia Kopnięcia" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Podgląd ćwiczenia Bieg" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Wymień ćwiczenie Kopnięcia" }),
  ).toBeEnabled();
  expect(getPlanRequest).toHaveBeenCalledTimes(2);
});
