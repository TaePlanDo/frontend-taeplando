import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { test } from "./playwright";
import { GroupsPage } from "./pages/groups.page";

test.describe("training groups", () => {
  test("creates, edits, and deletes a training group", async ({ page }) => {
    await createLocalTrainerAndLogin(page);

    const groups = new GroupsPage(page);
    await groups.goto();

    await groups.createGroup({
      name: "Grupa początkująca",
      minAge: 7,
      maxAge: 12,
      hours: 1,
      minutes: 30,
    });
    await groups.expectGroup("Grupa początkująca", 7, 12);

    await groups.editGroup("Grupa początkująca", {
      name: "Grupa zaawansowana",
      minAge: 13,
      maxAge: 18,
      hours: 2,
      minutes: 0,
    });
    await groups.expectGroup("Grupa zaawansowana", 13, 18);

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
      hours: 1,
      minutes: 0,
    });
    await groups.expectValidationError("Nazwa grupy jest wymagana");
  });
});
