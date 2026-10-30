import { describe, expect, it } from "vitest";

import { equipmentFormSchema } from "./equipment";

describe("equipmentFormSchema", () => {
  it("trims a valid name", () => {
    expect(
      equipmentFormSchema.parse({ name: "  Tarcza treningowa  " }),
    ).toEqual({ name: "Tarcza treningowa" });
  });

  it("requires a non-blank name", () => {
    const result = equipmentFormSchema.safeParse({ name: "   " });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toMatchObject([
      { path: ["name"], message: "Nazwa sprzętu jest wymagana" },
    ]);
  });

  it("rejects names longer than 255 characters", () => {
    const result = equipmentFormSchema.safeParse({ name: "a".repeat(256) });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toMatchObject([
      {
        path: ["name"],
        message: "Nazwa sprzętu może mieć maksymalnie 255 znaków",
      },
    ]);
  });
});
