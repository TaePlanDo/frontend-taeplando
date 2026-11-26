import { expect } from "@playwright/test";

import { openGeneratedPlan } from "./helpers/openGeneratedPlan";
import type { GroupFormValues } from "./pages/groups.page";
import { test } from "./playwright";

const groupValues = {
  name: "Grupa E2E wymiany",
  minAge: 7,
  maxAge: 14,
  durationMinutes: 20,
} satisfies GroupFormValues;

test.describe("plan exercise mutations", () => {
  test("opens alternatives and replaces an exercise", async ({ page }) => {
    const detail = await openGeneratedPlan(page, groupValues);

    const originalName = await detail.firstExerciseName();
    await detail.replaceExercise(originalName);

    await detail.expectExerciseAbsent(originalName);
    expect(await detail.firstExerciseName()).not.toBe(originalName);
  });

  test("removes an exercise after confirmation", async ({ page }) => {
    const detail = await openGeneratedPlan(page, {
      ...groupValues,
      name: "Grupa E2E usuwania",
    });

    const exerciseName = await detail.firstExerciseName();
    await detail.removeExercise(exerciseName);
    await detail.expectExerciseAbsent(exerciseName);
  });
});
