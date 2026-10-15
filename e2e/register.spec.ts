import { createLocalTrainer } from "./helpers/createLocalTrainer";
import { test } from "./playwright";
import { RegisterPage } from "./pages/register.page";

test.describe("register", () => {
  test("registers and reaches the home panel (auto-login)", async ({
    page,
  }) => {
    const email = `e2e.register.${Date.now()}@example.com`;
    const password = "E2eRegister1!";

    const register = new RegisterPage(page);
    await register.goto();
    await register.registerAs(email, password);
    await register.expectLoggedIn();
  });

  test("shows an error when email is already registered", async ({ page }) => {
    const trainer = await createLocalTrainer({
      email: `e2e.register.taken.${Date.now()}@example.com`,
    });

    const register = new RegisterPage(page);
    await register.goto();
    await register.registerAs(trainer.email, trainer.password);
    await register.expectEmailAlreadyRegistered();
  });
});
