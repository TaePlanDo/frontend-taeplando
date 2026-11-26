import { openGeneratedPlan } from "./helpers/openGeneratedPlan";
import type { GroupFormValues } from "./pages/groups.page";
import { test } from "./playwright";

const groupValues = {
  name: "Grupa E2E struktury",
  minAge: 7,
  maxAge: 14,
  durationMinutes: 45,
} satisfies GroupFormValues;

test.describe("plan structure edit", () => {
  test("reorders exercises within a phase", async ({ page }) => {
    const detail = await openGeneratedPlan(page, groupValues);
    await detail.reorderFirstReorderablePair();
  });

  test("renames the plan", async ({ page }) => {
    const detail = await openGeneratedPlan(page, {
      ...groupValues,
      name: "Grupa E2E nazwy",
    });

    await detail.renamePlan("Plan po edycji E2E");
  });
});
