import type { Page } from "@playwright/test";

import { seedSystemData } from "./helpers/backend";
import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { test } from "./playwright";
import { GroupsPage } from "./pages/groups.page";
import { PlanDetailPage } from "./pages/planDetail.page";
import { PlanGenerationPage } from "./pages/planGeneration.page";
import { PlanNewPage } from "./pages/planNew.page";

const groupValues = {
  name: "Grupa E2E generowania",
  minAge: 7,
  maxAge: 14,
  hours: 0,
  minutes: 20,
};

async function startPlanGeneration(page: Page): Promise<PlanGenerationPage> {
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

test.describe("plan generation", () => {
  test("generates a plan, shows the result, and regenerates", async ({
    page,
  }) => {
    seedSystemData();
    const generation = await startPlanGeneration(page);
    await generation.waitForPlanDetail();

    const detail = new PlanDetailPage(page);
    await detail.expectPlan(groupValues.name);
    const firstPlanId = detail.planId();

    await detail.regenerate();
    await generation.expectStarted();
    await generation.waitForPlanDetail();
    await detail.expectPlan(groupValues.name);
    await detail.expectDifferentPlanThan(firstPlanId);
  });

  test("shows a generation failure when there are no candidate exercises", async ({
    page,
  }) => {
    const generation = await startPlanGeneration(page);
    await generation.expectFailure();
  });
});
