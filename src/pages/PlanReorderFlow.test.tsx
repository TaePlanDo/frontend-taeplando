import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, expect, it, vi } from "vitest";
import type { PlanPhase } from "@/lib/plan/phaseGrouping";
import { planFixture } from "@/test/planFixture";
import { PlanDetailPage } from "./PlanDetailPage";

const reorder = vi.fn();
const getPlan = vi.fn();
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/hooks/plans/usePlanExerciseMutations", () => ({
  usePlanExerciseMutations: () => ({
    replace: { isPending: false, reset: vi.fn() },
    remove: { isPending: false },
  }),
}));
vi.mock("@/lib/api/plans", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/plans")>()),
  getPlanRequest: (...args: unknown[]) => getPlan(...args),
  updatePlanStructureRequest: (...args: unknown[]) => reorder(...args),
}));
vi.mock("@/components/plan/PlanPhaseSection", () => ({
  PlanPhaseSection: ({
    phase,
    onReorder,
  }: {
    phase: PlanPhase;
    onReorder: (a: string, b: string) => void;
  }) => (
    <div>
      <div data-testid={`phase-${phase.schema.position}`}>
        {phase.exercises.map((exercise) => (
          <span key={exercise.id}>{exercise.name_snapshot}</span>
        ))}
      </div>
      {phase.exercises.length > 1 && (
        <button
          onClick={() =>
            onReorder(phase.exercises[0].id, phase.exercises[1].id)
          }
        >
          Przenieś
        </button>
      )}
    </div>
  ),
}));

const plan = {
  ...planFixture,
  exercises: [
    { ...planFixture.exercises[0], position: 1 },
    {
      ...planFixture.exercises[0],
      id: "ex-3",
      name_snapshot: "Skok",
      position: 2,
    },
    { ...planFixture.exercises[1], position: 3 },
  ],
};

beforeEach(() => {
  reorder.mockReset();
  vi.mocked(toast.error).mockReset();
  getPlan.mockReset().mockResolvedValue(plan);
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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
}

it("displays the new order while saving and accepts the refreshed order", async () => {
  let finish!: (value: typeof plan) => void;
  let finishRefresh!: (value: typeof plan) => void;
  const updated = {
    ...plan,
    exercises: [
      { ...plan.exercises[1], position: 1 },
      { ...plan.exercises[0], position: 2 },
      plan.exercises[2],
    ],
  };
  getPlan.mockResolvedValueOnce(plan).mockReturnValueOnce(
    new Promise<typeof plan>((resolve) => {
      finishRefresh = resolve;
    }),
  );
  reorder.mockReturnValue(
    new Promise<typeof plan>((resolve) => {
      finish = resolve;
    }),
  );
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "Przenieś" }));
  await waitFor(() =>
    expect(
      within(screen.getByTestId("phase-1"))
        .getAllByText(/Bieg|Skok/)
        .map((element) => element.textContent),
    ).toEqual(["Skok", "Bieg"]),
  );
  await waitFor(() =>
    expect(reorder).toHaveBeenCalledWith({
      planId: "plan-1",
      planExerciseIds: ["ex-3", "ex-1", "ex-2"],
    }),
  );
  expect(await screen.findByText("Zapisywanie zmian…")).toBeInTheDocument();
  await act(async () => finish(updated));
  expect(await screen.findByText("Odświeżanie planu…")).toBeInTheDocument();
  expect(
    within(screen.getByTestId("phase-1"))
      .getAllByText(/Bieg|Skok/)
      .map((element) => element.textContent),
  ).toEqual(["Skok", "Bieg"]);
  await act(async () => finishRefresh(plan));
  await waitFor(() =>
    expect(
      within(screen.getByTestId("phase-1"))
        .getAllByText(/Bieg|Skok/)
        .map((element) => element.textContent),
    ).toEqual(["Bieg", "Skok"]),
  );
});

it("restores the old order and reports a failed save", async () => {
  let fail!: (reason: Error) => void;
  reorder.mockReturnValue(
    new Promise<void>((_, reject) => {
      fail = reject;
    }),
  );
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "Przenieś" }));
  await waitFor(() => expect(reorder).toHaveBeenCalled());
  await waitFor(() =>
    expect(
      within(screen.getByTestId("phase-1"))
        .getAllByText(/Bieg|Skok/)
        .map((element) => element.textContent),
    ).toEqual(["Skok", "Bieg"]),
  );
  await act(async () => fail(new Error("Błąd zapisu")));
  await waitFor(() =>
    expect(toast.error).toHaveBeenCalledWith(
      "Nie udało się zmienić kolejności ćwiczeń. Spróbuj ponownie.",
    ),
  );
  expect(
    within(screen.getByTestId("phase-1"))
      .getAllByText(/Bieg|Skok/)
      .map((element) => element.textContent),
  ).toEqual(["Bieg", "Skok"]);
});
