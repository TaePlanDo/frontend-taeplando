import { describe, expect, it } from "vitest";

import { formatGroupActivity, formatRelativeTime } from "./date-to-text";

const now = new Date("2026-10-15T12:00:00Z");

describe("formatRelativeTime", () => {
  it("returns a special text for under a minute", () => {
    expect(formatRelativeTime(new Date("2026-10-15T11:59:30Z"), now)).toBe(
      "mniej niż minutę temu",
    );
  });

  it("formats minutes", () => {
    expect(formatRelativeTime(new Date("2026-10-15T11:58:00Z"), now)).toBe(
      "2 minuty temu",
    );
  });

  it("formats hours", () => {
    expect(formatRelativeTime(new Date("2026-10-15T10:00:00Z"), now)).toBe(
      "2 godziny temu",
    );
  });

  it("formats days", () => {
    expect(formatRelativeTime(new Date("2026-10-12T12:00:00Z"), now)).toBe(
      "3 dni temu",
    );
  });

  it("formats months and years", () => {
    expect(formatRelativeTime(new Date("2026-08-15T12:00:00Z"), now)).toBe(
      "2 miesiące temu",
    );
    expect(formatRelativeTime(new Date("2025-10-15T12:00:00Z"), now)).toBe(
      "1 rok temu",
    );
  });
});

describe("formatGroupActivity", () => {
  it("uses Utworzono when created equals updated", () => {
    const created = new Date("2026-10-15T10:00:00Z");

    expect(formatGroupActivity(created, created, now)).toBe(
      "Utworzono 2 godziny temu",
    );
  });

  it("uses Edytowano when updated differs from created", () => {
    const created = new Date("2026-10-15T08:00:00Z");
    const updated = new Date("2026-10-15T11:59:30Z");

    expect(formatGroupActivity(created, updated, now)).toBe(
      "Edytowano mniej niż minutę temu",
    );
  });

  it("accepts ISO strings", () => {
    expect(
      formatGroupActivity("2026-10-15T08:00:00Z", "2026-10-15T10:00:00Z", now),
    ).toBe("Edytowano 2 godziny temu");
  });
});
