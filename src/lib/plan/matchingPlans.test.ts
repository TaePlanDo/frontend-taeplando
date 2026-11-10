import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPlansRequest } from "@/lib/api/plans";
import type { PlanListItem } from "@/types/plan";

import {
  fetchMatchingPlansForGeneration,
  lookupMatchingPlansOrEmpty,
  planMatchesGenerationParams,
} from "./matchingPlans";

vi.mock("@/lib/api/plans", () => ({
  getPlansRequest: vi.fn(),
}));

function plan(overrides: Partial<PlanListItem> = {}): PlanListItem {
  return {
    id: "plan-1",
    training_group_id: "group-1",
    name: "Plan A",
    participant_count: 20,
    group_name_snapshot: "Grupa",
    group_min_age_snapshot: 7,
    group_max_age_snapshot: 14,
    training_duration_snapshot: 90,
    available_equipment_snapshot: [],
    training_types_snapshot: [],
    schema_snapshot: [],
    generated_at: "2026-11-06T12:00:00Z",
    ...overrides,
  };
}

describe("planMatchesGenerationParams", () => {
  it("requires the same participant count", () => {
    expect(
      planMatchesGenerationParams(plan({ participant_count: 12 }), {
        participantCount: 20,
        equipmentIds: [],
        trainingTypeId: null,
      }),
    ).toBe(false);
  });

  it("requires the same equipment id set regardless of order", () => {
    const saved = plan({
      available_equipment_snapshot: [
        { id: "eq-2", name: "B" },
        { id: "eq-1", name: "A" },
      ],
    });
    expect(
      planMatchesGenerationParams(saved, {
        participantCount: 20,
        equipmentIds: ["eq-1", "eq-2"],
        trainingTypeId: null,
      }),
    ).toBe(true);
    expect(
      planMatchesGenerationParams(saved, {
        participantCount: 20,
        equipmentIds: ["eq-1"],
        trainingTypeId: null,
      }),
    ).toBe(false);
  });

  it("treats empty equipment as an exact empty match", () => {
    expect(
      planMatchesGenerationParams(plan(), {
        participantCount: 20,
        equipmentIds: [],
        trainingTypeId: null,
      }),
    ).toBe(true);
    expect(
      planMatchesGenerationParams(
        plan({
          available_equipment_snapshot: [{ id: "eq-1", name: "A" }],
        }),
        {
          participantCount: 20,
          equipmentIds: [],
          trainingTypeId: null,
        },
      ),
    ).toBe(false);
  });

  it("Auto matches only plans that stored no training type", () => {
    expect(
      planMatchesGenerationParams(plan({ training_types_snapshot: [] }), {
        participantCount: 20,
        equipmentIds: [],
        trainingTypeId: null,
      }),
    ).toBe(true);
    expect(
      planMatchesGenerationParams(
        plan({
          training_types_snapshot: [{ id: "tt-1", name: "Kata" }],
        }),
        {
          participantCount: 20,
          equipmentIds: [],
          trainingTypeId: null,
        },
      ),
    ).toBe(false);
  });

  it("requires the selected training type id in the snapshot", () => {
    expect(
      planMatchesGenerationParams(
        plan({
          training_types_snapshot: [{ id: "tt-1", name: "Kata" }],
        }),
        {
          participantCount: 20,
          equipmentIds: [],
          trainingTypeId: "tt-1",
        },
      ),
    ).toBe(true);
    expect(
      planMatchesGenerationParams(
        plan({
          training_types_snapshot: [{ id: "tt-2", name: "Kumite" }],
        }),
        {
          participantCount: 20,
          equipmentIds: [],
          trainingTypeId: "tt-1",
        },
      ),
    ).toBe(false);
    expect(
      planMatchesGenerationParams(plan({ training_types_snapshot: [] }), {
        participantCount: 20,
        equipmentIds: [],
        trainingTypeId: "tt-1",
      }),
    ).toBe(false);
  });
});

describe("fetchMatchingPlansForGeneration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches by group and participants then keeps exact matches only", async () => {
    vi.mocked(getPlansRequest).mockResolvedValue({
      items: [
        plan({
          id: "keep",
          available_equipment_snapshot: [{ id: "eq-1", name: "A" }],
          training_types_snapshot: [{ id: "tt-1", name: "Kata" }],
        }),
        plan({
          id: "drop-equipment",
          available_equipment_snapshot: [],
          training_types_snapshot: [{ id: "tt-1", name: "Kata" }],
        }),
      ],
      total: 2,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });

    const matches = await fetchMatchingPlansForGeneration({
      trainingGroupId: "group-1",
      participantCount: 20,
      equipmentIds: ["eq-1"],
      trainingTypeId: "tt-1",
    });

    expect(getPlansRequest).toHaveBeenCalledWith(1, 20, {
      training_group_ids: ["group-1"],
      min_participants: 20,
      max_participants: 20,
    });
    expect(matches.map(({ id }) => id)).toEqual(["keep"]);
  });

  it("limits displayed matches to four", async () => {
    vi.mocked(getPlansRequest).mockResolvedValue({
      items: Array.from({ length: 6 }, (_, index) =>
        plan({ id: `plan-${index}` }),
      ),
      total: 6,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });

    const matches = await fetchMatchingPlansForGeneration({
      trainingGroupId: "group-1",
      participantCount: 20,
      equipmentIds: [],
      trainingTypeId: null,
    });

    expect(matches).toHaveLength(4);
  });
});

describe("lookupMatchingPlansOrEmpty", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns an empty list when the lookup fails", async () => {
    vi.mocked(getPlansRequest).mockRejectedValue(new Error("offline"));

    await expect(
      lookupMatchingPlansOrEmpty({
        trainingGroupId: "group-1",
        participantCount: 20,
        equipmentIds: [],
        trainingTypeId: null,
      }),
    ).resolves.toEqual([]);
  });
});
