import { describe, expect, it } from "vitest";

import { formatDuration } from "./time";

describe("formatDuration", () => {
  it("shows only minutes under one hour", () => {
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(20)).toBe("20 min");
    expect(formatDuration(59)).toBe("59 min");
  });

  it("shows only hours for full hours", () => {
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(180)).toBe("3 h");
  });

  it("combines hours and minutes", () => {
    expect(formatDuration(80)).toBe("1 h 20 min");
    expect(formatDuration(200)).toBe("3 h 20 min");
    expect(formatDuration(745)).toBe("12 h 25 min");
  });

  it("ignores fractional minutes", () => {
    expect(formatDuration(90.9)).toBe("1 h 30 min");
  });
});
