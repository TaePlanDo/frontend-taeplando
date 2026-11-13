import type { Page } from "@playwright/test";

import { createLocalTrainerAndLogin } from "./createLocalTrainer";
import { GroupsPage, type GroupFormValues } from "../pages/groups.page";
import { PlanGenerationPage } from "../pages/planGeneration.page";
import { PlanNewPage } from "../pages/planNew.page";

export async function startPlanGeneration(
  page: Page,
  groupValues: GroupFormValues,
): Promise<PlanGenerationPage> {
  await createLocalTrainerAndLogin(page);

  const groups = new GroupsPage(page);
  await groups.goto();
  await groups.createGroup(groupValues);

  const planNew = new PlanNewPage(page);
  await planNew.goto();
  await planNew.selectGroup(groupValues.name);
  await planNew.submitGeneration();

  const generation = new PlanGenerationPage(page);
  await generation.expectStarted();
  return generation;
}
