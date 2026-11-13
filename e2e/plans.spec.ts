import { seedSystemData } from "./helpers/backend";
import { startPlanGeneration } from "./helpers/startPlanGeneration";
import { test } from "./playwright";
import { planNameForGroup, PlanDetailPage } from "./pages/planDetail.page";
import { PlansPage } from "./pages/plans.page";

const groupValues = {
  name: "Grupa E2E planów",
  minAge: 7,
  maxAge: 14,
  hours: 0,
  minutes: 20,
};

test.describe("saved plans", () => {
  test("lists a generated plan and deletes it", async ({ page }) => {
    seedSystemData();
    const generation = await startPlanGeneration(page, groupValues);
    await generation.waitForPlanDetail();

    const detail = new PlanDetailPage(page);
    await detail.expectPlan(groupValues.name);
    const planName = planNameForGroup(groupValues.name);

    const plans = new PlansPage(page);
    await plans.goto();
    await plans.expectPlan(planName);
    await plans.deletePlan(planName);
    await plans.expectNoPlans();
  });
});
