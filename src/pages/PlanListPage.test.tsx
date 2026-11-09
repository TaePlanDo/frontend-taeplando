import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { PaginatedListState } from "@/hooks/pagination/listState";
import type { PlanListItem } from "@/types/plan";

import { PlanListPage } from "./PlanListPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/filters/ListFiltersBar", () => ({
  ListFiltersBar: () => <div>filters-bar</div>,
}));

vi.mock("@/hooks/plans/usePlanGenerationOptions", () => ({
  usePlanGenerationOptions: () => ({
    equipment: { items: [] },
    trainingTypes: { items: [] },
    groups: { items: [] },
    state: { kind: "ready" },
    retry: vi.fn(),
  }),
}));

const plan: PlanListItem = {
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
};

vi.mock("@/hooks/plans/usePlans", () => ({
  usePlans: () => ({
    items: [plan],
    page: 1,
    totalPages: 1,
    total: 1,
    isFetching: false,
    listState: { kind: "ready" } as PaginatedListState,
    refetch: vi.fn(),
    goToPage: vi.fn(),
  }),
}));

vi.mock("@/hooks/plans/useDeletePlan", () => ({
  useDeletePlan: () => ({ deletePlan: vi.fn() }),
}));

describe("PlanListPage", () => {
  it("renders plans", () => {
    render(
      <MemoryRouter initialEntries={["/plans"]}>
        <PlanListPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("Trening techniki")).toBeTruthy();
    expect(screen.getByText("filters-bar")).toBeTruthy();
  });
});
