import { PLAN_GENERATION_LIMITS } from "@/lib/constants/planGeneration";
import type {
  PlanGenerationFormOutput,
  PlanGenerationFormValues,
} from "@/lib/validation/planGeneration";

export function serializePlanGenerationDraft(
  values: PlanGenerationFormOutput,
): string {
  const params = new URLSearchParams();
  params.set("group", values.trainingGroupId);
  params.set("participants", String(values.participantCount));
  if (values.equipmentIds.length > 0) {
    params.set("equipment", values.equipmentIds.join(","));
  }
  if (values.trainingTypeId !== null) {
    params.set("type", values.trainingTypeId);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function parsePlanGenerationDraft(
  search: string,
): PlanGenerationFormValues {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const participantsRaw = params.get("participants");
  const participants = participantsRaw ? Number(participantsRaw) : NaN;
  const type = params.get("type");
  const equipmentRaw = params.get("equipment");

  return {
    trainingGroupId: params.get("group")?.trim() ?? "",
    participantCount:
      Number.isInteger(participants) &&
      participants >= PLAN_GENERATION_LIMITS.MIN_PARTICIPANTS &&
      participants <= PLAN_GENERATION_LIMITS.MAX_PARTICIPANTS
        ? participants
        : PLAN_GENERATION_LIMITS.DEFAULT_PARTICIPANTS,
    equipmentIds: equipmentRaw
      ? equipmentRaw
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [],
    trainingTypeId: type && type !== "auto" ? type : null,
  };
}
