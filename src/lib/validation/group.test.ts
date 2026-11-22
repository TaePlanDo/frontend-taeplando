import { describe, expect, it } from "vitest";

import { groupDetailsSchema, type GroupDetailsFormValues } from "./group";

const validValues: GroupDetailsFormValues = {
  name: "Grupa wakacyjna",
  minAge: "7",
  maxAge: "14",
  durationMinutes: "90",
};

function errorsFor(values: Partial<GroupDetailsFormValues>) {
  const result = groupDetailsSchema.safeParse({ ...validValues, ...values });
  if (result.success) {
    return {};
  }
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join("."), issue.message]),
  );
}

describe("groupDetailsSchema", () => {
  it("parses valid values into numbers and trims the name", () => {
    const result = groupDetailsSchema.parse({
      ...validValues,
      name: "  Grupa wakacyjna  ",
    });

    expect(result).toEqual({
      name: "Grupa wakacyjna",
      minAge: 7,
      maxAge: 14,
      durationMinutes: 90,
    });
  });

  it("requires a non blank name", () => {
    expect(errorsFor({ name: "   " })).toEqual({
      name: "Nazwa grupy jest wymagana",
    });
  });

  it("rejects names longer than 255 characters", () => {
    expect(errorsFor({ name: "a".repeat(256) })).toEqual({
      name: "Nazwa grupy może mieć maksymalnie 255 znaków",
    });
  });

  it("requires both ages", () => {
    expect(errorsFor({ minAge: "", maxAge: "" })).toEqual({
      minAge: "Minimalny wiek jest wymagany",
      maxAge: "Maksymalny wiek jest wymagany",
    });
  });

  it.each(["abc", "-3", "4.5", "1e2"])(
    "rejects %s as an age that is not a whole number",
    (value) => {
      expect(errorsFor({ minAge: value })).toEqual({
        minAge: "Minimalny wiek musi być liczbą całkowitą",
      });
    },
  );

  it("returns only one error for an empty number field", () => {
    const result = groupDetailsSchema.safeParse({
      ...validValues,
      durationMinutes: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toHaveLength(1);
  });

  it("rejects ages outside of the allowed range", () => {
    expect(errorsFor({ minAge: "0", maxAge: "100" })).toEqual({
      minAge: "Minimalny wiek nie może być mniejszy niż 1",
      maxAge: "Maksymalny wiek nie może być większy niż 99",
    });
  });

  it("accepts equal min and max age", () => {
    expect(errorsFor({ minAge: "10", maxAge: "10" })).toEqual({});
  });

  it("rejects max age lower than min age", () => {
    expect(errorsFor({ minAge: "14", maxAge: "7" })).toEqual({
      maxAge: "Maksymalny wiek nie może być mniejszy od minimalnego",
    });
  });

  it("rejects a duration above the existing limit in minutes", () => {
    expect(errorsFor({ durationMinutes: "780" })).toEqual({
      durationMinutes: "Czas trwania nie może przekraczać 779 minut",
    });
  });

  it("requires the duration to be filled", () => {
    expect(errorsFor({ durationMinutes: "" })).toEqual({
      durationMinutes: "Podaj czas trwania treningu",
    });
  });

  it("rejects a duration of zero", () => {
    expect(errorsFor({ durationMinutes: "0" })).toEqual({
      durationMinutes: "Podaj czas trwania treningu",
    });
  });

  it("accepts both short and multi-hour durations in minutes", () => {
    expect(errorsFor({ durationMinutes: "45" })).toEqual({});
    expect(errorsFor({ durationMinutes: "120" })).toEqual({});
  });
});
