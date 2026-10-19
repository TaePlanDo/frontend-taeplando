import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { test } from "./playwright";
import { AccountPage } from "./pages/account.page";
import { LoginPage } from "./pages/login.page";

test.describe("change password", () => {
  test("changes the password and permits a new login", async ({ page }) => {
    const trainer = await createLocalTrainerAndLogin(page);
    const newPassword = "E2eChanged1!";

    const account = new AccountPage(page);
    await account.goto();
    await account.changePassword(trainer.password, newPassword);
    await account.expectPasswordChanged();

    await account.logout();
    await account.expectLoggedOut();

    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(trainer.email, newPassword);
    await login.expectLoggedIn();
  });

  test("shows an error for an incorrect old password", async ({ page }) => {
    await createLocalTrainerAndLogin(page);

    const account = new AccountPage(page);
    await account.goto();
    await account.changePassword("incorrect-old-password", "E2eChanged1!");
    await account.expectPasswordError("Niepoprawne hasło");
  });

  test("shows an error when the new password has no special character", async ({
    page,
  }) => {
    const trainer = await createLocalTrainerAndLogin(page);

    const account = new AccountPage(page);
    await account.goto();
    await account.changePassword(trainer.password, "E2eChanged1");
    await account.expectPasswordError(
      "Hasło musi zawierać co najmniej jeden znak specjalny",
    );
  });
});
