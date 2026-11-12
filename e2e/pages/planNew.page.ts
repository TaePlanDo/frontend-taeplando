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

  async submitGeneration(): Promise<void> {
    await this.generateButton.click();
  }
}
