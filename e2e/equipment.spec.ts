import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { EquipmentPage } from "./pages/equipment.page";
import { test } from "./playwright";

test.describe("equipment management", () => {
  test("creates, edits, and deletes training equipment", async ({ page }) => {
    await createLocalTrainerAndLogin(page);

    const equipment = new EquipmentPage(page);
    await equipment.goto();
    await equipment.expectNoEquipment();

    await equipment.createEquipment({ name: "Tarcza treningowa" });
    await equipment.expectEquipment("Tarcza treningowa");

    await equipment.editEquipment("Tarcza treningowa", {
      name: "Tarcza treningowa XL",
    });
    await equipment.expectEquipment("Tarcza treningowa XL");

    await equipment.deleteEquipment("Tarcza treningowa XL");
    await equipment.expectNoEquipment();
  });

  test("shows validation feedback for a missing required field", async ({
    page,
  }) => {
    await createLocalTrainerAndLogin(page);

    const equipment = new EquipmentPage(page);
    await equipment.goto();
    await equipment.submitInvalidEquipment();

    await equipment.expectValidationError("Nazwa sprzętu jest wymagana");
  });
});
