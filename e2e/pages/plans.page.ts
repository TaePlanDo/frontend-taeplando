import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class PlansPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emptyListMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Zapisane plany" });
    this.emptyListMessage = page.getByText("Brak planów", { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto("/plans");
    await expect(this.heading).toBeVisible();
  }

  async expectPlan(name: string): Promise<void> {
    await expect(this.planCard(name)).toBeVisible();
  }

  async expectNoPlans(): Promise<void> {
    await expect(this.emptyListMessage).toBeVisible();
  }

  async deletePlan(name: string): Promise<void> {
    await this.planCard(name).getByRole("button", { name: "Usuń" }).click();

    const confirmationDialog = this.page.getByRole("alertdialog", {
      name: "Usuwanie planu",
    });
    await expect(confirmationDialog).toBeVisible();
    await confirmationDialog.getByRole("button", { name: "Usuń" }).click();
  }

  private planCard(name: string): Locator {
    return this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByRole("heading", { name, exact: true }) });
  }
}
