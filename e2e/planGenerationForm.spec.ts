import { seedSystemData } from "./helpers/backend";
import { createEquipment } from "./helpers/createEquipment";
import { createGroup } from "./helpers/createGroup";
import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { PlanGenerationPage } from "./pages/planGeneration.page";
import { PlanNewPage } from "./pages/planNew.page";
import { test } from "./playwright";

const group = {
  name: "Grupa E2E formularz",
  minAge: 8,
  maxAge: 12,
  durationMinutes: 45,
};

test.describe("plan generation form", () => {
  test("starts generation after filling all parameters", async ({ page }) => {
    await seedSystemData();
    const trainer = await createLocalTrainerAndLogin(page);
    await createGroup(trainer, group);
    await createEquipment(trainer, "Tarcza E2E");

    const planNew = new PlanNewPage(page);
    await planNew.goto();
    await planNew.selectGroup(group.name);
    await planNew.setParticipants(12);
    await planNew.addEquipment("Tarcza E2E");
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
