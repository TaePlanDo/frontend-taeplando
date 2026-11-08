import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PaginatedListState } from "@/hooks/pagination/listState";
import type { PlanListItem } from "@/types/plan";

import { PlanListPage } from "./PlanListPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const plans: PlanListItem[] = [
  {
    id: "plan-1",
    training_group_id: "group-1",
    name: "Trening techniki",
    participant_count: 14,
    group_name_snapshot: "Grupa dzieci",
    group_min_age_snapshot: 6,
    group_max_age_snapshot: 12,
    training_duration_snapshot: 60,
    available_equipment_snapshot: [],
    training_types_snapshot: [{ id: "tt-1", name: "Technika" }],
    schema_snapshot: [],
    generated_at: "2026-11-05T12:00:00Z",
  },
];

const refetch = vi.fn();
const goToPage = vi.fn();
const deletePlan = vi.fn();

const plansState = {
  items: plans,
  page: 1,
  totalPages: 1,
  total: plans.length,
  isLoading: false,
  isFetching: false,
  isError: false,
  listState: { kind: "ready" } as PaginatedListState,
  refetch,
  goToPage,
};

vi.mock("@/hooks/plans/usePlans", () => ({
  usePlans: () => plansState,
}));

vi.mock("@/hooks/plans/useDeletePlan", () => ({
  useDeletePlan: () => ({
    deletePlan,
    isDeleting: false,
    error: null,
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <PlanListPage />
    </MemoryRouter>,
  );
}

describe("PlanListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    plansState.items = plans;
    plansState.page = 1;
    plansState.totalPages = 1;
    plansState.total = plans.length;
    plansState.listState = { kind: "ready" };
  });

  it("shows the empty view when there are no plans", () => {
    plansState.items = [];
    plansState.total = 0;
    plansState.listState = { kind: "empty" };

    renderPage();

    expect(screen.getByText("Brak planów")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Generuj/ })).toHaveAttribute(
      "href",
      "/plans/new",
    );
  });

  it("renders plans, count and filter button", () => {
    renderPage();

    expect(screen.getByText("Trening techniki")).toBeTruthy();
    expect(screen.getByText("Grupa:")).toBeTruthy();
    expect(screen.getAllByText("1 plan").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Filtry" })).toBeTruthy();
  });

  it("retries after an error", () => {
    plansState.items = [];
    plansState.listState = { kind: "unavailable", reason: "error" };

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
