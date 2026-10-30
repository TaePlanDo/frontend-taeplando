import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type EquipmentFormValues = {
  name: string;
};

export class EquipmentPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addEquipmentButton: Locator;
  readonly equipmentDialog: Locator;
  readonly nameInput: Locator;
  readonly emptyListMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      name: "Sprzęt treningowy",
    });
    this.addEquipmentButton = page.getByRole("button", {
      name: "Dodaj sprzęt",
    });
    this.equipmentDialog = page.getByRole("dialog");
    this.nameInput = this.equipmentDialog.getByRole("textbox", {
      name: "Nazwa",
    });
    this.emptyListMessage = page.getByText("Jeszcze nie masz żadnego sprzętu");
  }

  async goto(): Promise<void> {
    await this.page.goto("/equipment");
    await expect(this.heading).toBeVisible();
  }

  async createEquipment(values: EquipmentFormValues): Promise<void> {
    await this.addEquipmentButton.click();
    await expect(this.equipmentDialog).toBeVisible();
    await this.fillEquipmentForm(values);
    await this.equipmentDialog
      .getByRole("button", { name: "Dodaj sprzęt" })
      .click();
    await expect(this.equipmentDialog).toHaveCount(0);
  }

  async editEquipment(
    currentName: string,
    values: EquipmentFormValues,
  ): Promise<void> {
    await this.equipmentCard(currentName)
      .getByRole("button", { name: "Edytuj" })
      .click();
    await expect(this.equipmentDialog).toBeVisible();
    await this.fillEquipmentForm(values);
    await this.equipmentDialog
      .getByRole("button", { name: "Edytuj sprzęt" })
      .click();
    await expect(this.equipmentDialog).toHaveCount(0);
  }

  async deleteEquipment(name: string): Promise<void> {
    await this.equipmentCard(name)
      .getByRole("button", { name: "Usuń" })
      .click();

    const confirmationDialog = this.page.getByRole("alertdialog", {
      name: "Usuwanie sprzętu",
    });
    await expect(confirmationDialog).toBeVisible();
    await confirmationDialog.getByRole("button", { name: "Usuń" }).click();
  }

  async submitInvalidEquipment(): Promise<void> {
    await this.addEquipmentButton.click();
    await expect(this.equipmentDialog).toBeVisible();
    await this.equipmentDialog
      .getByRole("button", { name: "Dodaj sprzęt" })
      .click();
  }

  async expectEquipment(name: string): Promise<void> {
    await expect(this.equipmentCard(name)).toBeVisible();
  }

  async expectNoEquipment(): Promise<void> {
    await expect(this.emptyListMessage).toBeVisible();
  }

  async expectValidationError(message: string): Promise<void> {
    const error = this.equipmentDialog
      .getByRole("alert")
      .filter({ hasText: message });
    await expect(error).toContainText(message);
    await expect(this.equipmentDialog).toBeVisible();
  }

  private equipmentCard(name: string): Locator {
    return this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByRole("heading", { name, exact: true }) });
  }

  private async fillEquipmentForm(values: EquipmentFormValues): Promise<void> {
    await this.nameInput.fill(values.name);
  }
}
