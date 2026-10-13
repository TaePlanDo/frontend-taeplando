import { describe, expect, it } from "vitest";

import { validateRegistrationPassword } from "./registration";

describe("validateRegistrationPassword", () => {
  it.each([
    ["Trening123!", "Trening123!", null],
    ["Żółw123!", "Żółw123!", null],
    ["Ab1!", "Ab1!", "Hasło musi mieć co najmniej 8 znaków"],
    [
      "ą".repeat(35) + "A1!",
      "ą".repeat(35) + "A1!",
      "Hasło może mieć maksymalnie 72 bajty",
    ],
    ["12345678!", "12345678!", "Hasło musi zawierać co najmniej jedną literę"],
    ["Trening!!", "Trening!!", "Hasło musi zawierać co najmniej jedną cyfrę"],
    [
      "Trening123",
      "Trening123",
      "Hasło musi zawierać co najmniej jeden znak specjalny",
    ],
    ["Trening123!", "Inne123!", "Hasła nie są zgodne"],
  ])("validates case %#", (password, confirmation, expected) => {
    expect(validateRegistrationPassword(password, confirmation)).toBe(expected);
  });

  it("accepts a password containing exactly 72 UTF-8 bytes", () => {
    const password = "a".repeat(70) + "1!";

    expect(validateRegistrationPassword(password, password)).toBeNull();
  });
});
