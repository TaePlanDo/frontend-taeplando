import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { test } from "./playwright";
import { AccountPage } from "./pages/account.page";

test.describe("logout", () => {
  test("logs out, returns to login, and blocks the panel", async ({ page }) => {
    await createLocalTrainerAndLogin(page);

    const account = new AccountPage(page);
    await account.goto();
    await account.logout();
    await account.expectLoggedOut();
  });
});
