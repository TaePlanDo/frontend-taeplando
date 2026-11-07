import { PLAN_GENERATION_LIMITS } from "@/lib/constants/planGeneration";
import type {
  PlanGenerationFormValues,
  PlanGenerationFormOutput,
} from "@/lib/validation/planGeneration";
import type { PlanGenerationParameters } from "@/types/plan";

export function toPlanGenerationFormValues(): PlanGenerationFormValues {
  return {
    trainingGroupId: "",
    participantCount: PLAN_GENERATION_LIMITS.DEFAULT_PARTICIPANTS,
    equipmentIds: [],
    trainingTypeId: null,
  };
}

export function toPlanGenerationParameters(
  values: PlanGenerationFormOutput,
): PlanGenerationParameters {
  return {
    training_group_id: values.trainingGroupId,
    participant_count: values.participantCount,
    available_equipment_ids: values.equipmentIds,
    training_type_id: values.trainingTypeId,
  };
}
