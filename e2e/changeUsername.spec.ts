import { createLocalTrainer } from "./helpers/createLocalTrainer";
import { mockGoogleAccount } from "./helpers/mockGoogleAccount";
import { expect, test } from "./playwright";
import { AccountPage } from "./pages/account.page";
import { LoginPage } from "./pages/login.page";

test.describe("change username", () => {
  test("reads account data and updates the username through the modal", async ({
    page,
  }) => {
    const trainer = await createLocalTrainer();

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, trainer.password);
    await expect(page).toHaveURL("/");

    const account = new AccountPage(page);
    await account.goto();

    await account.expectUsernameAndEmailShown(trainer.email, trainer.fullName);

    await account.changeUsername("Testowy Użytkownik");
    await account.expectUsernameAndEmailShown(
      trainer.email,
      "Testowy Użytkownik",
    );

    await page.goBack();
    await expect(page).toHaveURL("/");
    await account.goto();
    await account.expectUsernameAndEmailShown(
      trainer.email,
      "Testowy Użytkownik",
    );
  });

  test("does not show edit buttons for an OAuth-based account", async ({
    page,
  }) => {
    await mockGoogleAccount(page);

    const account = new AccountPage(page);
    await account.goto();

    await account.expectUsernameAndEmailShown(
      "google@example.com",
      "Google User",
    );
    await account.expectNotChangedButton();
  });

  test("rejects an empty or too-long username", async ({ page }) => {
    const trainer = await createLocalTrainer();

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, trainer.password);
    await expect(page).toHaveURL("/");

    const account = new AccountPage(page);
    await account.goto();

    await account.expectInvalidUsernameChanged();
  });
});
