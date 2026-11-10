import { getPlansRequest } from "@/lib/api/plans";
import type { PlanGenerationFormOutput } from "@/lib/validation/planGeneration";
import type { PlanListItem } from "@/types/plan";

const MATCH_CANDIDATE_PAGE_SIZE = 20;
export const MATCHING_PLANS_DISPLAY_LIMIT = 4;

function sameIdSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  const rightIds = new Set(right);
  return left.every((id) => rightIds.has(id));
}

export function planMatchesGenerationParams(
  plan: PlanListItem,
  values: Pick<
    PlanGenerationFormOutput,
    "participantCount" | "equipmentIds" | "trainingTypeId"
  >,
): boolean {
  if (plan.participant_count !== values.participantCount) {
    return false;
  }

  const equipmentIds = plan.available_equipment_snapshot.map(({ id }) => id);
  if (!sameIdSet(equipmentIds, values.equipmentIds)) {
    return false;
  }

  if (values.trainingTypeId === null) {
    return plan.training_types_snapshot.length === 0;
  }
  return plan.training_types_snapshot.some(
    ({ id }) => id === values.trainingTypeId,
  );
}

export async function fetchMatchingPlansForGeneration(
  values: PlanGenerationFormOutput,
): Promise<PlanListItem[]> {
  const page = await getPlansRequest(1, MATCH_CANDIDATE_PAGE_SIZE, {
    training_group_ids: [values.trainingGroupId],
    min_participants: values.participantCount,
    max_participants: values.participantCount,
  });

  return page.items
    .filter((plan) => planMatchesGenerationParams(plan, values))
    .slice(0, MATCHING_PLANS_DISPLAY_LIMIT);
}

export async function lookupMatchingPlansOrEmpty(
  values: PlanGenerationFormOutput,
): Promise<PlanListItem[]> {
  try {
    return await fetchMatchingPlansForGeneration(values);
  } catch {
    return [];
  }
}
