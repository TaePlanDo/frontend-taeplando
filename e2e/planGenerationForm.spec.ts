import { seedSystemData } from "./helpers/backend";
import { createEquipment } from "./helpers/createEquipment";
import { createGroup } from "./helpers/createGroup";
import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { mockGoogleAccount } from "./helpers/mockGoogleAccount";
import { frontendOrigin } from "./env";
import { PlanGenerationPage } from "./pages/planGeneration.page";
import { PlanNewPage } from "./pages/planNew.page";
import { expect, test } from "./playwright";

const group = {
  name: "Grupa E2E formularz",
  minAge: 8,
  maxAge: 12,
  durationMinutes: 45,
};

test.describe("plan generation form", () => {
  test("keeps a long dropdown below the navbar after interface scaling", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await mockGoogleAccount(page);
    const catalogs = {
      "training-groups": Array.from({ length: 40 }, (_, index) => ({
        id: `group-${index}`,
        name: `Grupa ${index + 1}`,
        min_age: 7,
        max_age: 14,
        duration_minutes: 60,
        schema: [],
        created_at: "2026-11-21T00:00:00Z",
        updated_at: "2026-11-21T00:00:00Z",
      })),
      equipment: [],
      "training-types": [],
    };
    await Promise.all(
      Object.entries(catalogs).map(([catalog, items]) =>
        page.route(`${frontendOrigin}/api/${catalog}**`, (route) =>
          route.fulfill({
            json: {
              items,
              total: items.length,
              page: 1,
              page_size: 100,
              total_pages: 1,
            },
          }),
        ),
      ),
    );
    await new PlanNewPage(page).goto();
    await page.setViewportSize({ width: 4480, height: 900 });
    await page.getByRole("combobox", { name: "Grupa treningowa" }).click();
    const popup = page.getByRole("listbox");
    await expect(popup).toBeInViewport({ ratio: 1 });
    await expect
      .poll(async () => {
        const navbar = (await page
          .locator('[data-slot="navbar"]')
          .boundingBox())!;
        return (await popup.boundingBox())!.y - navbar.y - navbar.height;
      })
      .toBeGreaterThanOrEqual(0);
  });

  for (const width of [390, 1280]) {
    test(`keeps the equipment dropdown compact and anchored at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const trainer = await createLocalTrainerAndLogin(page);
      await createGroup(trainer, group);
      await createEquipment(trainer, "Tarcza E2E");
      await createEquipment(trainer, "Piłka E2E");
      await new PlanNewPage(page).goto();

      const trigger = page.getByRole("combobox", { name: "Sprzęt treningowy" });
      const triggerId = await trigger.getAttribute("id");
      const anchor = page.locator(`[id="${triggerId}"]`);
      await trigger.click();
      const popup = page.getByRole("dialog", { name: "Sprzęt treningowy" });
      await expect(popup).toBeVisible();
      await expect(popup).toBeInViewport({ ratio: 1 });
      const initialBox = (await popup.boundingBox())!;
      const expectPlacement = () =>
        expect
          .poll(async () => {
            const field = (await anchor.boundingBox())!;
            const menu = (await popup.boundingBox())!;
            const gap = Math.max(
              field.y - menu.y - menu.height,
              menu.y - field.y - field.height,
            );
            return Math.max(
              Math.abs(gap - 16),
              Math.abs(menu.width - field.width),
            );
          })
          .toBeLessThan(1);
      await expectPlacement();
      const initialHeight = initialBox.height;
      const optionsHeight = await popup
        .getByRole("option")
        .evaluateAll((options) =>
          options.reduce(
            (height, option) => height + option.getBoundingClientRect().height,
            0,
          ),
        );
      expect(initialHeight).toBeLessThanOrEqual(optionsHeight + 16);

      for (const name of ["Tarcza E2E", "Piłka E2E", "Tarcza E2E"]) {
        const option = popup.getByRole("option", { name, exact: true });
        await option.click();
        await expect(option).toHaveCSS("outline-style", "none");
        await expectPlacement();
        await expect
          .poll(async () =>
            Math.abs((await popup.boundingBox())!.height - initialHeight),
          )
          .toBeLessThan(1);
      }

      const first = popup.getByRole("option").first();
      const last = popup.getByRole("option").last();
      await first.focus();
      await first.press("End");
      await expect(last).toBeFocused();
      const selected = await last.getAttribute("aria-selected");
      await last.press("Space");
      await expect(last).toHaveAttribute(
        "aria-selected",
        selected === "true" ? "false" : "true",
      );
      await expect(popup).toBeVisible();
      await last.press("ArrowDown");
      await expect(first).toBeFocused();
      await first.click();
      await expect(first).toHaveCSS("outline-style", "none");

      await page.mouse.click(5, 500);
      await expect(popup).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  }

  test("starts generation after filling all parameters", async ({ page }) => {
    seedSystemData();
    const trainer = await createLocalTrainerAndLogin(page);
    await createGroup(trainer, group);
    await createEquipment(trainer, "Tarcza E2E");
    await createEquipment(trainer, "Piłka E2E");

    const planNew = new PlanNewPage(page);
    await planNew.goto();
    await planNew.selectGroup(group.name);
    await planNew.setParticipants(12);
    await page.getByRole("combobox", { name: "Sprzęt treningowy" }).click();
    const list = page.getByRole("listbox", { name: "Sprzęt treningowy" });
    const shield = list.getByRole("option", {
      name: "Tarcza E2E",
      exact: true,
    });
    const ball = list.getByRole("option", { name: "Piłka E2E", exact: true });
    await shield.click();
    await ball.click();
    await expect(shield).toHaveAttribute("aria-selected", "true");
    await expect(ball).toHaveAttribute("aria-selected", "true");
    await shield.click();
    await expect(shield).toHaveAttribute("aria-selected", "false");
    await shield.click();
    await page.keyboard.press("Escape");
    await expect(list).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Usuń Tarcza E2E" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Usuń Piłka E2E" }),
    ).toBeVisible();
    await planNew.selectTrainingType("Kondycja");
    await planNew.submitGeneration();

    await new PlanGenerationPage(page).expectStarted();
  });

  test("shows an error when no group is selected", async ({ page }) => {
    const trainer = await createLocalTrainerAndLogin(page);
    await createGroup(trainer, group);

    const planNew = new PlanNewPage(page);
    await planNew.goto();
    await planNew.setParticipants(12);
    await planNew.submitGeneration();

    await planNew.expectValidationError("Wybierz grupę treningową");
  });
});
