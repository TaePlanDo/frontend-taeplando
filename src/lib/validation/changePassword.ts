import { validateRegistrationPassword } from "./registration";

export function validateChangePassword(
  oldPassword: string,
  newPassword: string,
  confirmation: string,
): string | null {
  if (oldPassword.length === 0) {
    return "Podaj obecne hasło";
  }

  if (oldPassword === newPassword) {
    return "Nowe hasło musi być inne niż obecne";
  }

  return validateRegistrationPassword(newPassword, confirmation);
}
