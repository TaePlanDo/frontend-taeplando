import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class PlanNewPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly groupSelect: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: /Wybór/ });
    this.groupSelect = page.getByRole("combobox", { name: "Grupa treningowa" });
    this.generateButton = page.getByRole("button", { name: "Generuj plan" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/plans/new");
    await expect(this.heading).toBeVisible();
    await expect(this.groupSelect).toBeEnabled();
  }

  async selectGroup(groupName: string): Promise<void> {
    await this.groupSelect.click();
    await this.page
      .getByRole("option", { name: groupName, exact: true })
      .click();
    await expect(this.groupSelect).toContainText(groupName);
  }

  async setParticipants(count: number): Promise<void> {
    const slider = this.page.getByRole("slider", {
      name: "Liczba uczestników",
    });
    await slider.focus();
    await slider.press("Home");
    for (let i = 1; i < count; i++) {
      await slider.press("ArrowRight");
    }
    await expect(slider).toHaveAttribute("aria-valuenow", String(count));
  }

  async addEquipment(name: string): Promise<void> {
    await this.page
      .getByRole("combobox", { name: "Sprzęt treningowy" })
      .click();
    await this.page.getByRole("option", { name, exact: true }).click();
    await expect(
      this.page.getByRole("button", { name: `Usuń ${name}` }),
    ).toBeVisible();
  }

  async selectTrainingType(name: string): Promise<void> {
    const select = this.page.getByRole("combobox", { name: "Typ treningu" });
    await select.click();
    await this.page.getByRole("option", { name, exact: true }).click();
    await expect(select).toContainText(name);
  }

  async submitGeneration(): Promise<void> {
    await this.generateButton.click();
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(this.page.getByText(message)).toBeVisible();
    await expect(this.page).toHaveURL(/\/plans\/new$/);
  }

  async expectChoiceDialog(groupName: string): Promise<void> {
    const dialog = this.choiceDialog(groupName);
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: "Wybierz z ostatnich planów" }),
    ).toBeVisible();
  }

  async openMatchingPlan(groupName: string, planName: string): Promise<void> {
    await this.choiceDialog(groupName)
      .locator('[data-slot="card"]')
      .filter({
        has: this.page.getByRole("heading", { name: planName, exact: true }),
      })
      .click();
  }

  private choiceDialog(groupName: string): Locator {
    return this.page.getByRole("dialog", { name: groupName });
  }
}
