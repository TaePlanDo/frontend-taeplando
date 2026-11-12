import { expect, test, type Locator, type Page } from "./playwright";

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

async function scrollIntoPhase(page: Page, header: Locator) {
  await header.scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 900);
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
    await expect(firstHeader).toBeVisible();
    await expect(secondHeader).toBeAttached();

    const firstRow = page.getByRole("button", { name: /Exercise 1-1/ });
    await expect(firstRow.getByText("1", { exact: true })).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: /Exercise 1-2/ })
        .getByText("2", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: /Exercise 2-1/ })
        .getByText("1", { exact: true }),
    ).toBeVisible();
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

    const navbar = await page.locator("header").first().boundingBox();
    expect(navbar).not.toBeNull();
    const navbarBottom = navbar!.y + navbar!.height;
    await scrollIntoPhase(page, firstHeader);
    await expect
      .poll(async () =>
        Math.abs((await firstHeader.boundingBox())!.y - navbarBottom),
      )
      .toBeLessThanOrEqual(1.5);
    await expect(firstHeader).toBeInViewport();

    await scrollIntoPhase(page, secondHeader);
    await expect
      .poll(async () =>
        Math.abs((await secondHeader.boundingBox())!.y - navbarBottom),
      )
      .toBeLessThanOrEqual(1.5);
    await expect(firstHeader).not.toBeInViewport();
    await expect(secondHeader).toBeInViewport();
  });
}
