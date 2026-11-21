import { seedSystemData } from "./helpers/backend";
import { createEquipment } from "./helpers/createEquipment";
import { createGroup } from "./helpers/createGroup";
import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
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
  for (const width of [390, 1280]) {
    test(`opens a compact multiselect popup with outside space at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const trainer = await createLocalTrainerAndLogin(page);
      await createGroup(trainer, group);
      await createEquipment(trainer, "Tarcza E2E");
      await createEquipment(trainer, "Piłka E2E");
      await new PlanNewPage(page).goto();

      const trigger = page.getByRole("combobox", { name: "Sprzęt treningowy" });
      await trigger.click();
      const popup = page.getByRole("dialog", { name: "Sprzęt treningowy" });
      await expect(popup).toBeVisible();
      await expect(popup).toBeInViewport({ ratio: 1 });
      const initialBox = (await popup.boundingBox())!;
      expect(initialBox.x).toBeGreaterThanOrEqual(16);
      expect(width - initialBox.x - initialBox.width).toBeGreaterThanOrEqual(
        16,
      );
      expect(initialBox.y).toBeGreaterThanOrEqual(64);
      expect(900 - initialBox.y - initialBox.height).toBeGreaterThanOrEqual(16);
      expect(
        Math.abs(initialBox.x + initialBox.width / 2 - width / 2),
      ).toBeLessThan(1);
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
        await expect
          .poll(async () =>
            Math.abs((await popup.boundingBox())!.height - initialHeight),
          )
          .toBeLessThan(1);
      }

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
