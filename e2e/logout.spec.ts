import { createLocalTrainer } from "./helpers/createLocalTrainer";
import { expect, test } from "./playwright";
import { AccountPage } from "./pages/account.page";
import { LoginPage } from "./pages/login.page";

test.describe("logout", () => {
  test("logs out, returns to login, and blocks the panel", async ({ page }) => {
    const trainer = await createLocalTrainer();

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, trainer.password);
    await expect(page).toHaveURL("/");

    const account = new AccountPage(page);
    await account.goto();
    await account.logout();
    await account.expectLoggedOut();
  });
});
