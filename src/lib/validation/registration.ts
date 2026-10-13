export function validateRegistrationPassword(
  password: string,
  confirmation: string,
): string | null {
  if ([...password].length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków";
  }

  if (new TextEncoder().encode(password).length > 72) {
    return "Hasło może mieć maksymalnie 72 bajty";
  }

  if (!/\p{L}/u.test(password)) {
    return "Hasło musi zawierać co najmniej jedną literę";
  }

  if (!/\p{Nd}/u.test(password)) {
    return "Hasło musi zawierać co najmniej jedną cyfrę";
  }

  if (!/[^\p{L}\p{N}]/u.test(password)) {
    return "Hasło musi zawierać co najmniej jeden znak specjalny";
  }

  if (password !== confirmation) {
    return "Hasła nie są zgodne";
  }

  return null;
}
