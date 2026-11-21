import { describe, expect, it } from "vitest";

import type { Group } from "@/types/group";

import {
  normalizeGroup,
  toFormValues,
  toGroupWrite,
  toPlanSchemaSnapshot,
} from "./group";

const group: Group = {
  id: "0ac590e1-2a46-4cb7-8944-803e364cc46b",
  name: "Młodzież",
  min_age: 7,
  max_age: 14,
  duration_minutes: 90,
  created_at: "2026-10-11T12:00:00Z",
  updated_at: "2026-10-11T13:00:00Z",
  schema: [
    {
      segment_id: 3,
      segment_code: "MAIN",
      segment_name: "Część główna",
      percentage: 100,
      position: 1,
    },
  ],
};

describe("group mappers", () => {
  it("normalizes schema percentages from API strings to numbers", () => {
    const fromApi = {
      ...group,
      schema: [{ ...group.schema[0], percentage: "70" }],
    } as unknown as Group;

    expect(normalizeGroup(fromApi).schema[0].percentage).toBe(70);
  });

  it("defaults a new group to the full age range", () => {
    expect(toFormValues(null)).toEqual({
      name: "",
      minAge: "1",
      maxAge: "99",
      durationMinutes: "60",
    });
    expect(toFormValues(undefined)).toEqual(toFormValues(null));
  });

  it("keeps an existing group duration in minutes", () => {
    expect(toFormValues(group)).toEqual({
      name: "Młodzież",
      minAge: "7",
      maxAge: "14",
      durationMinutes: "90",
    });
  });

  it("keeps full-hour durations in minutes", () => {
    expect(toFormValues({ ...group, duration_minutes: 120 })).toMatchObject({
      durationMinutes: "120",
    });
  });

  it("builds the API payload from parsed form values", () => {
    expect(
      toGroupWrite({
        name: "Młodzież",
        minAge: 7,
        maxAge: 14,
        durationMinutes: 90,
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
        durationMinutes: Number(values.durationMinutes),
      }).duration_minutes,
    ).toBe(745);
  });

  it("maps group schema items into plan schema snapshot fields", () => {
    expect(toPlanSchemaSnapshot(group.schema)).toEqual([
      {
        position: 1,
        segment_id: 3,
        code: "MAIN",
        name: "Część główna",
        percentage: 100,
      },
    ]);
  });
});
