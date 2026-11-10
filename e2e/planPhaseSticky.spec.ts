import { expect, test, type Locator, type Page } from "@playwright/test";

import { planFixture } from "../src/test/planFixture";
import { mockGoogleAccount } from "./helpers/mockGoogleAccount";
import { frontendOrigin } from "./env";

const plan = {
  ...planFixture,
  exercises: planFixture.schema_snapshot.flatMap((phase, phaseIndex) =>
    Array.from({ length: 8 }, (_, index) => ({
      ...planFixture.exercises[phaseIndex],
      id: `exercise-${phaseIndex}-${index}`,
      name_snapshot: `Exercise ${phaseIndex + 1}-${index + 1}`,
      position: index + 1,
      schema_position: phase.position,
    })),
  ),
};

async function scrollToPhaseOffset(page: Page, phase: Locator, offset: number) {
  await phase.evaluate((element, distance) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + distance);
  }, offset);
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`phase headers stick and rating columns align on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await mockGoogleAccount(page);
    await page.route(
      `${frontendOrigin}/api/training-plans/${plan.id}`,
      (route) => route.fulfill({ json: plan }),
    );
    await page.goto(`/plans/${plan.id}`);

    const firstHeader = page.getByRole("button", { name: /Rozgrzewka/ });
    const secondHeader = page.getByRole("button", {
      name: /Cz\u0119\u015b\u0107 g\u0142\u00f3wna/,
    });
    const firstPhase = firstHeader.locator("..");
    const secondPhase = secondHeader.locator("..");
    await expect(firstHeader).toBeVisible();
    await expect(secondHeader).toBeAttached();

    const firstRow = page.getByRole("button", { name: /Exercise 1-1/ });
    for (const label of [
      "Intensywno\u015b\u0107",
      "Trudno\u015b\u0107",
      "G\u00f3rne partie",
      "Dolne partie",
      "Core",
    ]) {
      const badge = firstHeader
        .locator('[data-slot="badge"]')
        .filter({ hasText: label });
      const meter = firstRow.getByRole("meter", { name: label });
      const [badgeBox, meterBox] = await Promise.all([
        badge.boundingBox(),
        meter.boundingBox(),
      ]);
      expect(badgeBox).not.toBeNull();
      expect(meterBox).not.toBeNull();
      expect(
        Math.abs(
          badgeBox!.x +
            badgeBox!.width / 2 -
            (meterBox!.x + meterBox!.width / 2),
        ),
      ).toBeLessThanOrEqual(2);
    }

    const navbarBottom = await page
      .locator("header")
      .first()
      .evaluate((header) => header.getBoundingClientRect().bottom);
    await scrollToPhaseOffset(page, firstPhase, 300);
    await expect
      .poll(async () =>
        Math.abs((await firstHeader.boundingBox())!.y - navbarBottom),
      )
      .toBeLessThanOrEqual(1.5);
    await expect(firstHeader).toBeInViewport();

    await scrollToPhaseOffset(page, secondPhase, 300);
    await expect
      .poll(async () =>
        Math.abs((await secondHeader.boundingBox())!.y - navbarBottom),
      )
      .toBeLessThanOrEqual(1.5);
    await expect(firstHeader).not.toBeInViewport();
    await expect(secondHeader).toBeInViewport();
  });
}
