import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { expect, test } from "./playwright";
import { GroupsPage } from "./pages/groups.page";

test.describe("training groups", () => {
  test("uses a mobile duration carousel in minutes and preserves values on desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await createLocalTrainerAndLogin(page);
    const groups = new GroupsPage(page);
    await groups.goto();
    await groups.addGroupButton.click();
    await groups.groupNameInput.fill("Grupa mobilna");
    const duration = groups.groupDialog.getByRole("spinbutton", {
      name: "Czas trwania (min)",
    });
    await duration.press("ArrowRight");
    await expect(duration).toHaveAttribute("aria-valuenow", "1");
    await duration.getByText("90", { exact: true }).click();
    await expect(duration).toHaveAttribute("aria-valuenow", "90");
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(groups.durationInput).toHaveValue("90");
    await expect(groups.minAgeInput).toHaveAttribute("aria-valuenow", "1");
    await expect(groups.maxAgeInput).toHaveAttribute("aria-valuenow", "99");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(duration).toHaveAttribute("aria-valuenow", "90");
    await groups.groupDialog.getByRole("button", { name: "Utwórz" }).click();
    await expect(groups.groupDialog).toHaveCount(0);
    await groups.expectGroup("Grupa mobilna", 1, 99, "1 h 30 min");
  });
  test("creates, edits, and deletes a training group", async ({ page }) => {
    await createLocalTrainerAndLogin(page);

    const groups = new GroupsPage(page);
    await groups.goto();

    await groups.createGroup({
      name: "Grupa początkująca",
      minAge: 7,
      maxAge: 12,
      durationMinutes: 90,
    });
    await groups.expectGroup("Grupa początkująca", 7, 12, "1 h 30 min");

    await groups.editGroup("Grupa początkująca", {
      name: "Grupa zaawansowana",
      minAge: 13,
      maxAge: 18,
      durationMinutes: 120,
    });
    await groups.expectGroup("Grupa zaawansowana", 13, 18, "2 h");

    await groups.deleteGroup("Grupa zaawansowana");
    await groups.expectNoGroups();
  });

  test("shows validation feedback for an invalid training group", async ({
    page,
  }) => {
    await createLocalTrainerAndLogin(page);

    const groups = new GroupsPage(page);
    await groups.goto();
    await groups.submitInvalidGroup({
      name: "",
      minAge: 7,
      maxAge: 12,
      durationMinutes: 60,
    });
    await groups.expectValidationError("Nazwa grupy jest wymagana");
  });
});
