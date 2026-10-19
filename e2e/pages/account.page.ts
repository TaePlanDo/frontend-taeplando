import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class AccountPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly logoutButton: Locator;
  readonly changePasswordButton: Locator;
  readonly passwordDialog: Locator;
  readonly oldPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly passwordError: Locator;
  readonly changeUsernameButton: Locator;
  readonly usernameInput: Locator;
  readonly changeSubmitButton: Locator;
  readonly usernameError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Dane użytkownika" });
    this.logoutButton = page.getByRole("button", { name: "Wyloguj się" });
    this.changePasswordButton = page.getByRole("button", {
      name: "Zmień hasło",
    });
    this.passwordDialog = page.getByRole("dialog", { name: "Zmień hasło" });
    this.oldPasswordInput = this.passwordDialog.getByLabel("Stare Hasło");
    this.newPasswordInput = this.passwordDialog.getByLabel("Nowe Hasło");
    this.confirmPasswordInput = this.passwordDialog.getByLabel("Powtórz Hasło");
    this.passwordError = this.passwordDialog.getByRole("alert");
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

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.changePasswordButton.click();
    await expect(this.oldPasswordInput).toBeVisible();
    await this.oldPasswordInput.fill(oldPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.passwordDialog
      .getByRole("button", { name: "Zmień hasło" })
      .click();
  }

  async expectPasswordChanged(): Promise<void> {
    await expect(this.passwordDialog).toHaveCount(0);
  }

  async expectPasswordError(message: string): Promise<void> {
    await expect(this.passwordError).toBeVisible();
    await expect(this.passwordError).toContainText(message);
    await expect(this.oldPasswordInput).toBeVisible();
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
    await expect(this.changePasswordButton).toHaveCount(0);
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
