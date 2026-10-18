import { createLocalTrainer } from "./helpers/createLocalTrainer";
import { expect, test } from "./playwright";
import { AccountPage } from "./pages/account.page";
import { LoginPage } from "./pages/login.page";

test.describe("change password", () => {
  test("changes the password and permits a new login", async ({ page }) => {
    const trainer = await createLocalTrainer();
    const newPassword = "E2eChanged1!";

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, trainer.password);
    await expect(page).toHaveURL("/");

    const account = new AccountPage(page);
    await account.goto();
    await account.changePassword(trainer.password, newPassword);
    await account.expectPasswordChanged();

    await account.logout();
    await account.expectLoggedOut();

    await login.goto();
    await login.loginAs(trainer.email, newPassword);
    await login.expectLoggedIn();
  });

  test("shows an error for an incorrect old password", async ({ page }) => {
    const trainer = await createLocalTrainer();

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, trainer.password);
    await expect(page).toHaveURL("/");

    const account = new AccountPage(page);
    await account.goto();
    await account.changePassword("incorrect-old-password", "E2eChanged1!");
    await account.expectIncorrectOldPassword();
  });
});
