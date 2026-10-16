import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Dane użytkownika" });
    this.logoutButton = page.getByRole("button", { name: "Wyloguj się" });
  }

  async goto(): Promise<void> {
    await this.page.goto("/account");
    await expect(this.heading).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /** Guest: on login, back/history and protected routes stay blocked. */
  async expectLoggedOut(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await this.page.goBack();
    await expect(this.page).toHaveURL(/\/login/);

    await expect(
      this.page.getByRole("button", { name: "Zaloguj się" }),
    ).toBeVisible();
    await expect(this.logoutButton).toHaveCount(0);

    await this.page.goto("/");
    await expect(this.page).toHaveURL(/\/login/);

    await this.page.goto("/account");
    await expect(this.page).toHaveURL(/\/login/);
  }
}
