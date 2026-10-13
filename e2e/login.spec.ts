import { createLocalTrainer } from "./helpers/createLocalTrainer";
import { test } from "./playwright";
import { LoginPage } from "./pages/login.page";

test.describe("login", () => {
  test("logs in and reaches the home panel", async ({ page }) => {
    const trainer = await createLocalTrainer();

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, trainer.password);
    await login.expectLoggedIn();
  });

  test("shows an error for wrong password", async ({ page }) => {
    const trainer = await createLocalTrainer();

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, "wrong-password");
    await login.expectInvalidCredentials();
  });
});
