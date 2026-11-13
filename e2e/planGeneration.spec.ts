import { seedSystemData } from "./helpers/backend";
import { startPlanGeneration } from "./helpers/startPlanGeneration";
import { expect, test } from "./playwright";
import { planNameForGroup, PlanDetailPage } from "./pages/planDetail.page";
import { PlanNewPage } from "./pages/planNew.page";

const groupValues = {
  name: "Grupa E2E generowania",
  minAge: 7,
  maxAge: 14,
  hours: 0,
  minutes: 20,
};

test.describe("plan generation", () => {
  test("generates a plan, shows the result, and regenerates", async ({
    page,
  }) => {
    seedSystemData();
    const generation = await startPlanGeneration(page, groupValues);
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

  test("offers matching plans when generating with the same parameters", async ({
    page,
  }) => {
    seedSystemData();
    const generation = await startPlanGeneration(page, groupValues);
    await generation.waitForPlanDetail();

    const detail = new PlanDetailPage(page);
    await detail.expectPlan(groupValues.name);
    const planName = planNameForGroup(groupValues.name);
    const existingPlanId = detail.planId();

    const planNew = new PlanNewPage(page);
    await planNew.goto();
    await planNew.selectGroup(groupValues.name);
    await planNew.submitGeneration();
    await planNew.expectChoiceDialog(groupValues.name);
    await planNew.openMatchingPlan(groupValues.name, planName);

    await detail.expectPlan(groupValues.name);
    expect(detail.planId()).toBe(existingPlanId);
  });

  test("shows a generation failure when there are no candidate exercises", async ({
    page,
  }) => {
    const generation = await startPlanGeneration(page, groupValues);
    await generation.expectFailure();
  });
});
