import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Hasło", { exact: true });
    this.submitButton = page.getByRole("button", { name: "Zaloguj się" });
    this.errorAlert = page.getByRole("alert");
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
    await expect(this.submitButton).toBeVisible();
  }

  async loginAs(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Authenticated: landed on home and session survives a /login visit. */
  async expectLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL("/");
    await expect(this.submitButton).toHaveCount(0);
    await this.page.goto("/login");
    await expect(this.page).toHaveURL("/");
  }

  async expectInvalidCredentials(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toContainText(
      "Nieprawidłowy email lub hasło",
    );
    await expect(this.page).toHaveURL(/\/login/);
  }
}
