import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class PlanDetailPage {
  readonly page: Page;
  readonly regenerateButton: Locator;
  readonly regenerateDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.regenerateButton = page.getByRole("button", {
      name: "Wygeneruj ponownie",
    });
    this.regenerateDialog = page.getByRole("dialog", {
      name: "Potwierdź liczebność grupy",
    });
  }

  planId(): string {
    const match = this.page.url().match(/\/plans\/([^/?#]+)/);
    if (!match?.[1] || match[1] === "new" || match[1] === "generation") {
      throw new Error(`Expected a plan detail URL, got ${this.page.url()}`);
    }
    return match[1];
  }

  async expectPlan(groupName: string): Promise<void> {
    await expect(
      this.page.getByRole("heading", {
        name: new RegExp(`Plan treningowy.*${groupName}`),
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { level: 4 }).first(),
    ).toBeVisible();
  }

  async expectDifferentPlanThan(previousPlanId: string): Promise<void> {
    expect(this.planId()).not.toBe(previousPlanId);
  }

  async regenerate(): Promise<void> {
    await this.regenerateButton.click();
    await expect(this.regenerateDialog).toBeVisible();
    await this.regenerateDialog
      .getByRole("button", { name: "Generuj" })
      .click();
  }
}
