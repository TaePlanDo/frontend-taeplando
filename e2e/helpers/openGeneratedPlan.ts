import type { Page } from "@playwright/test";

import type { GroupFormValues } from "../pages/groups.page";
import { PlanDetailPage } from "../pages/planDetail.page";
import { seedSystemData } from "./backend";
import { startPlanGeneration } from "./startPlanGeneration";

export async function openGeneratedPlan(
  page: Page,
  values: GroupFormValues,
): Promise<PlanDetailPage> {
  seedSystemData();
  const generation = await startPlanGeneration(page, values);
  await generation.waitForPlanDetail();
  const detail = new PlanDetailPage(page);
  await detail.expectPlan(values.name);
  return detail;
}
