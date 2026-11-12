import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const GENERATION_TIMEOUT_MS = 30_000;

export class PlanGenerationPage {
  readonly page: Page;
  readonly failureTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.failureTitle = page.getByRole("heading", {
      name: "Generowanie nie powiodło się",
    });
  }

  async expectStarted(): Promise<void> {
    await expect(this.page).toHaveURL(/\/plans\/generation\//, {
      timeout: 10_000,
    });
  }

  async waitForPlanDetail(): Promise<void> {
    await expect(this.page).toHaveURL(/\/plans\/(?!new$|generation\/)[^/]+$/, {
      timeout: GENERATION_TIMEOUT_MS,
    });
  }

  async expectFailure(): Promise<void> {
    await expect(this.page).toHaveURL(/\/plans\/generation\//);
    await expect(this.failureTitle).toBeVisible({
      timeout: GENERATION_TIMEOUT_MS,
    });
  }
}
