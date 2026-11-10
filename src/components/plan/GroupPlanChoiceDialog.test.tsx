import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Group } from "@/types/group";
import type { PlanListItem } from "@/types/plan";

import { GroupPlanChoiceDialog } from "./GroupPlanChoiceDialog";

const group: Group = {
  id: "group-1",
  name: "Grupa młodzików",
  min_age: 12,
  max_age: 16,
  duration_minutes: 75,
  created_at: "2026-11-01T12:00:00Z",
  updated_at: "2026-11-01T12:00:00Z",
  schema: [
    {
      segment_id: 1,
      segment_code: "WARMUP",
      segment_name: "Rozgrzewka",
      percentage: 20,
      position: 1,
    },
    {
      segment_id: 3,
      segment_code: "MAIN",
      segment_name: "Część główna",
      percentage: 80,
      position: 2,
    },
  ],
};

const plan: PlanListItem = {
  id: "plan-1",
  training_group_id: "group-1",
  name: "Kata Taegeuk 1–3 – powtórka",
  participant_count: 12,
  group_name_snapshot: "Grupa młodzików",
  group_min_age_snapshot: 12,
  group_max_age_snapshot: 16,
  training_duration_snapshot: 75,
  available_equipment_snapshot: [],
  training_types_snapshot: [{ id: "tt-1", name: "Kata" }],
  schema_snapshot: [],
  generated_at: "2026-11-06T12:00:00Z",
};

describe("GroupPlanChoiceDialog", () => {
  it("shows group summary, matching plans without delete, and generate CTA", () => {
    const onGenerateNew = vi.fn();
    const onOpenPlan = vi.fn();

    render(
      <GroupPlanChoiceDialog
        open
        onOpenChange={vi.fn()}
        group={group}
        participantCount={12}
        plans={[plan]}
        onOpenPlan={onOpenPlan}
        onGenerateNew={onGenerateNew}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Grupa młodzików" }),
    ).toBeVisible();
    expect(screen.getByText("Wiek")).toBeVisible();
    expect(screen.getByText("Uczestnicy")).toBeVisible();
    expect(screen.getByText("Czas sesji")).toBeVisible();
    expect(screen.getByText("12–16 lat")).toBeVisible();
    expect(screen.getAllByText("12 osób").length).toBeGreaterThan(0);
    expect(screen.getAllByText("75 min").length).toBeGreaterThan(0);
    expect(screen.getByText("Schemat grupy")).toBeVisible();
    expect(screen.getByText("Wybierz z ostatnich planów")).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Kata Taegeuk 1–3 – powtórka" }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: /Usuń/ })).toBeNull();
    expect(screen.getByText("Otwórz >")).toBeVisible();

    fireEvent.click(
      screen.getByRole("link", { name: /Kata Taegeuk 1–3 – powtórka/ }),
    );
    expect(onOpenPlan).toHaveBeenCalledWith("plan-1");

    fireEvent.click(screen.getByRole("button", { name: "Generuj nowy plan" }));
    expect(onGenerateNew).toHaveBeenCalledTimes(1);
  });
});
