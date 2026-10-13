import { describe, expect, it } from "vitest";

import { validateChangePassword } from "./changePassword";

describe("validateChangePassword", () => {
  it("accepts a valid new password that matches the confirmation", () => {
    expect(
      validateChangePassword("Stare123!", "Trening123!", "Trening123!"),
    ).toBeNull();
  });

  it("requires the old password", () => {
    expect(validateChangePassword("", "Trening123!", "Trening123!")).toBe(
      "Podaj obecne hasło",
    );
  });

  it("rejects when the new password equals the old password", () => {
    expect(
      validateChangePassword("Trening123!", "Trening123!", "Trening123!"),
    ).toBe("Nowe hasło musi być inne niż obecne");
  });

  it("rejects a new password shorter than 8 characters", () => {
    expect(validateChangePassword("Stare123!", "Ab1!", "Ab1!")).toBe(
      "Hasło musi mieć co najmniej 8 znaków",
    );
  });

  it("rejects a new password longer than 72 UTF-8 bytes", () => {
    const tooLong = "ą".repeat(35) + "A1!";
    expect(validateChangePassword("Stare123!", tooLong, tooLong)).toBe(
      "Hasło może mieć maksymalnie 72 bajty",
    );
  });

  it("rejects a new password without a letter", () => {
    expect(validateChangePassword("Stare123!", "12345678!", "12345678!")).toBe(
      "Hasło musi zawierać co najmniej jedną literę",
    );
  });

  it("rejects a new password without a digit", () => {
    expect(validateChangePassword("Stare123!", "Trening!!", "Trening!!")).toBe(
      "Hasło musi zawierać co najmniej jedną cyfrę",
    );
  });

  it("rejects a new password without a special character", () => {
    expect(
      validateChangePassword("Stare123!", "Trening123", "Trening123"),
    ).toBe("Hasło musi zawierać co najmniej jeden znak specjalny");
  });

  it("rejects when the new password and confirmation differ", () => {
    expect(validateChangePassword("Stare123!", "Trening123!", "Inne123!")).toBe(
      "Hasła nie są zgodne",
    );
  });
});
