import { describe, expect, it } from "vitest";

import type { Group } from "@/types/group";

import { toFormValues, toGroupWrite } from "./group";

const group: Group = {
  id: "0ac590e1-2a46-4cb7-8944-803e364cc46b",
  name: "Młodzież",
  min_age: 7,
  max_age: 14,
  duration_minutes: 90,
  created_at: new Date("2026-10-11T12:00:00Z"),
  updated_at: new Date("2026-10-11T13:00:00Z"),
};

describe("group mappers", () => {
  it("returns empty values for a new group", () => {
    expect(toFormValues(null)).toEqual({
      name: "",
      minAge: "",
      maxAge: "",
      hours: "0",
      minutes: "0",
    });
    expect(toFormValues(undefined)).toEqual(toFormValues(null));
  });

  it("splits duration into hours and minutes for an existing group", () => {
    expect(toFormValues(group)).toEqual({
      name: "Młodzież",
      minAge: "7",
      maxAge: "14",
      hours: "1",
      minutes: "30",
    });
  });

  it("keeps full hours with zero minutes", () => {
    expect(toFormValues({ ...group, duration_minutes: 120 })).toMatchObject({
      hours: "2",
      minutes: "0",
    });
  });

  it("builds the API payload from parsed form values", () => {
    expect(
      toGroupWrite({
        name: "Młodzież",
        minAge: 7,
        maxAge: 14,
        hours: 1,
        minutes: 30,
      }),
    ).toEqual({
      name: "Młodzież",
      min_age: 7,
      max_age: 14,
      duration_minutes: 90,
    });
  });

  it("returns the same duration after mapping back and forth", () => {
    const values = toFormValues({ ...group, duration_minutes: 745 });

    expect(
      toGroupWrite({
        name: values.name,
        minAge: Number(values.minAge),
        maxAge: Number(values.maxAge),
        hours: Number(values.hours),
        minutes: Number(values.minutes),
      }).duration_minutes,
    ).toBe(745);
  });
});
