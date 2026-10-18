import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly logoutButton: Locator;
  readonly changeUsernameButton: Locator;
  readonly usernameInput: Locator;
  readonly changeSubmitButton: Locator;
  readonly usernameError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Dane użytkownika" });
    this.logoutButton = page.getByRole("button", { name: "Wyloguj się" });
    this.changeUsernameButton = page.getByRole("button", {
      name: "Zmień nazwę",
    });
    this.usernameInput = page.getByLabel("Nazwa użytkownika");
    this.changeSubmitButton = page.getByRole("button", { name: "Zmień dane" });
    this.usernameError = page.getByRole("alert");
  }

  async goto(): Promise<void> {
    await this.page.goto("/account");
    await expect(this.heading).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  async expectUsernameAndEmailShown(
    email: string,
    username: string,
  ): Promise<void> {
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
    await expect(this.page.getByText(username, { exact: true })).toBeVisible();
  }

  async changeUsername(newName: string): Promise<void> {
    await this.changeUsernameButton.click();
    await expect(this.usernameInput).toBeVisible();
    await this.usernameInput.fill(newName);
    await this.changeSubmitButton.click();
  }

  async expectNotChangedButton(): Promise<void> {
    await expect(this.changeUsernameButton).toHaveCount(0);
  }

  async expectInvalidUsernameChanged(): Promise<void> {
    await this.changeUsernameButton.click();
    await expect(this.usernameInput).toBeVisible();

    await this.usernameInput.fill("");
    await this.changeSubmitButton.click();
    await expect(this.usernameError).toBeVisible();
    await expect(this.usernameError).toContainText(
      "Niepoprawna nazwa użytkownika",
    );

    await this.usernameInput.fill("a".repeat(256));
    await this.changeSubmitButton.click();
    await expect(this.usernameError).toBeVisible();
    await expect(this.usernameError).toContainText(
      "Niepoprawna nazwa użytkownika",
    );
  }

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
