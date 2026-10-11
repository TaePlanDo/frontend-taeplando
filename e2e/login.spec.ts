import { test } from "@playwright/test";

import { resetDb } from "./helpers/resetDb";
import { LoginPage } from "./pages/login.page";
import { demoTrainer } from "./testData";

test.describe("login", () => {
  test("logs in and reaches the home panel", async ({ page }) => {
    await resetDb();
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(demoTrainer.email, demoTrainer.password);
    await login.expectLoggedIn();
  });

  test("shows an error for wrong password", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(demoTrainer.email, "wrong-password");
    await login.expectInvalidCredentials();
  });
});
