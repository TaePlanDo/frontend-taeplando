import type { NavigateFunction } from "react-router-dom";

import { serializePlanGenerationDraft } from "@/lib/plan/planGenerationDraft";
import type { PlanGenerationFormOutput } from "@/lib/validation/planGeneration";

export function openPlanFromGenerationDraft(
  navigate: NavigateFunction,
  values: PlanGenerationFormOutput,
  planId: string,
): void {
  const draftSearch = serializePlanGenerationDraft(values);
  navigate({ pathname: "/plans/new", search: draftSearch }, { replace: true });
  navigate(`/plans/${planId}`, {
    state: { backTo: `/plans/new${draftSearch}` },
  });
}
