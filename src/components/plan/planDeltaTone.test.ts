import { describe, expect, it } from "vitest";

import { deltaMinutesBadgeClass } from "./planDeltaTone";

describe("deltaMinutesBadgeClass", () => {
  it("maps delta to background and text classes", () => {
    expect(deltaMinutesBadgeClass(0)).toBe("bg-muted text-muted-foreground");
    expect(deltaMinutesBadgeClass(2)).toBe("bg-primary/15 text-primary");
    expect(deltaMinutesBadgeClass(-1)).toBe("bg-primary/15 text-destructive");
  });
});
