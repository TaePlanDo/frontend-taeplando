import { describe, expect, it } from "vitest";

import { planDetailBackLabel } from "./planDetailBackLabel";

describe("planDetailBackLabel", () => {
  it("labels return to the generation form", () => {
    expect(planDetailBackLabel("/plans/new")).toBe("Wróć do generowania");
    expect(planDetailBackLabel("/plans/new?group=1&participants=20")).toBe(
      "Wróć do generowania",
    );
  });

  it("labels return to the plans list by default", () => {
    expect(planDetailBackLabel("/plans")).toBe("Wróć do listy");
    expect(planDetailBackLabel("/plans?name=kata")).toBe("Wróć do listy");
  });
});
