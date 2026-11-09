import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PaginatedListState } from "@/hooks/pagination/listState";
import type { PlanListItem } from "@/types/plan";

import { PlanListPage } from "./PlanListPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/plan/PlanListFiltersBar", () => ({
  PlanListFiltersBar: () => <div>filters-bar</div>,
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

const plansState = {
  items: plans,
  page: 1,
  totalPages: 1,
  total: plans.length,
  isLoading: false,
  isFetching: false,
  isError: false,
  listState: { kind: "ready" } as PaginatedListState,
  refetch: vi.fn(),
  goToPage: vi.fn(),
};

vi.mock("@/hooks/plans/usePlans", () => ({
  usePlans: () => plansState,
}));

vi.mock("@/hooks/plans/useDeletePlan", () => ({
  useDeletePlan: () => ({
    deletePlan: vi.fn(),
    isDeleting: false,
    error: null,
  }),
}));

function renderPage(entry = "/plans") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <PlanListPage />
    </MemoryRouter>,
  );
}

describe("PlanListPage", () => {
  beforeEach(() => {
    plansState.items = plans;
    plansState.total = plans.length;
    plansState.listState = { kind: "ready" };
  });

  it("renders plans", () => {
    renderPage();
    expect(screen.getByText("Trening techniki")).toBeTruthy();
    expect(screen.getByText("filters-bar")).toBeTruthy();
  });

  it("shows filtered empty copy", () => {
    plansState.items = [];
    plansState.total = 0;
    plansState.listState = { kind: "empty" };
    renderPage("/plans?min_age=6&max_age=16");
    expect(screen.getByText("Brak planów spełniających kryteria")).toBeTruthy();
  });
});
