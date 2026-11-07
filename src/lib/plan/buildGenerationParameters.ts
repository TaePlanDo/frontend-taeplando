import type { PlanDetail, PlanGenerationParameters } from "@/types/plan";

/** Rebuilds generation params from a plan snapshot; uses the primary training type. */
export function buildGenerationParametersFromPlan(
  plan: PlanDetail,
  participantCount: number,
): PlanGenerationParameters {
  const primaryTrainingType = plan.training_types_snapshot[0];

  return {
    training_group_id: plan.training_group_id,
    participant_count: participantCount,
    available_equipment_ids: plan.available_equipment_snapshot.map(
      ({ id }) => id,
    ),
    training_type_id: primaryTrainingType?.id ?? null,
  };
}
