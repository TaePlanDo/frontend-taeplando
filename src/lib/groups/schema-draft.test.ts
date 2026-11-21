import { describe, expect, it } from "vitest";

import {
  addSegment,
  canSaveSchema,
  initDraftFromSchema,
  removeSegment,
  setSegmentPercentage,
  toSchemaWritePayload,
  type SchemaDraftItem,
} from "./schema-draft";

const catalog = [
  { id: 1, code: "WARMUP", name: "Rozgrzewka" },
  { id: 3, code: "MAIN", name: "Część główna" },
  { id: 4, code: "COOLDOWN", name: "Wyciszenie" },
];

function percentages(items: SchemaDraftItem[]) {
  return items.map((item) => item.percentage);
}

function sum(items: SchemaDraftItem[]) {
  return items.reduce((total, item) => total + item.percentage, 0);
}

function draft(values: number[]): SchemaDraftItem[] {
  return values.map((percentage, index) => ({
    segmentId: index,
    segmentCode: `SEGMENT_${index}`,
    segmentName: `Segment ${index}`,
    percentage,
  }));
}

describe("schema-draft", () => {
  it("decreases only the selected segment and releases its percentage into the pool", () => {
    const start = draft([20, 60, 20]);
    const before = structuredClone(start);
    const next = setSegmentPercentage(start, 1, 45);

    expect(percentages(next)).toEqual([20, 45, 20]);
    expect(sum(next)).toBe(85);
    expect(canSaveSchema(next)).toBe(false);
    expect(next[0]).toBe(start[0]);
    expect(next[2]).toBe(start[2]);
    expect(start).toEqual(before);
  });

  it("allocates only free percentages and never takes from another segment", () => {
    const start = draft([20, 60, 20]);
    const reduced = setSegmentPercentage(start, 0, 10);
    const increased = setSegmentPercentage(reduced, 1, 65);
    expect(percentages(increased)).toEqual([10, 65, 20]);
    expect(sum(increased)).toBe(95);

    const capped = setSegmentPercentage(increased, 2, 50);
    expect(percentages(capped)).toEqual([10, 65, 25]);
    expect(canSaveSchema(capped)).toBe(true);
    expect(setSegmentPercentage(capped, 0, 11)).toBe(capped);
  });

  it("rounds to whole percentages and keeps the minimum at 1%", () => {
    const start = draft([10, 50, 10]);
    expect(percentages(setSegmentPercentage(start, 0, 20.7))).toEqual([
      21, 50, 10,
    ]);
    expect(percentages(setSegmentPercentage(start, 0, 200))).toEqual([
      40, 50, 10,
    ]);
    expect(percentages(setSegmentPercentage(start, 0, -1))).toEqual([
      1, 50, 10,
    ]);
  });

  it("allows a single segment to release and reclaim its free percentages", () => {
    const single = draft([100]);
    const reduced = setSegmentPercentage(single, 0, 1);
    expect(percentages(reduced)).toEqual([1]);
    expect(percentages(setSegmentPercentage(reduced, 0, 100))).toEqual([100]);
  });

  it("ignores invalid edits", () => {
    const items = initDraftFromSchema([], catalog);
    expect(setSegmentPercentage(items, -1, 10)).toBe(items);
    expect(setSegmentPercentage(items, catalog[0].id, NaN)).toBe(items);
    expect(setSegmentPercentage(items, catalog[0].id, Infinity)).toBe(items);
  });

  it("equal-splits an empty schema across the catalog", () => {
    const items = initDraftFromSchema([], catalog);
    expect(items).toHaveLength(3);
    expect(sum(items)).toBe(100);
  });

  it("maps an existing schema by position", () => {
    const items = initDraftFromSchema(
      [
        {
          segment_id: 3,
          segment_code: "MAIN",
          segment_name: "Część główna",
          percentage: 70,
          position: 2,
        },
        {
          segment_id: 1,
          segment_code: "WARMUP",
          segment_name: "Rozgrzewka",
          percentage: 30,
          position: 1,
        },
      ],
      catalog,
    );
    expect(items.map((item) => item.segmentCode)).toEqual(["WARMUP", "MAIN"]);
    expect(percentages(items)).toEqual([30, 70]);
  });

  it("adds a segment at 1% from the largest row and rejects duplicates", () => {
    const start: SchemaDraftItem[] = [
      {
        segmentId: 3,
        segmentCode: "MAIN",
        segmentName: "Część główna",
        percentage: 100,
      },
    ];
    const next = addSegment(start, catalog[0]);
    expect(percentages(next)).toEqual([99, 1]);
    expect(addSegment(next, catalog[0])).toEqual(next);
  });

  it("adds a segment from the free pool without changing existing percentages", () => {
    const start = draft([20, 40, 20]);
    const next = addSegment(start, catalog[2]);
    expect(percentages(next)).toEqual([20, 40, 20, 1]);
    expect(sum(next)).toBe(81);
    expect(start.map((item) => item.percentage)).toEqual([20, 40, 20]);
  });

  it("removes a segment from an incomplete draft without filling the free pool", () => {
    const start = draft([20, 40, 20]);
    const next = removeSegment(start, 1);
    expect(percentages(next)).toEqual([20, 20]);
    expect(sum(next)).toBe(40);
    expect(next.map((item) => item.segmentId)).toEqual([0, 2]);
    expect(start.map((item) => item.percentage)).toEqual([20, 40, 20]);
  });

  it("removes a row from a full schema without reallocating its percentages", () => {
    const start: SchemaDraftItem[] = [
      {
        segmentId: 1,
        segmentCode: "WARMUP",
        segmentName: "Rozgrzewka",
        percentage: 20,
      },
      {
        segmentId: 3,
        segmentCode: "MAIN",
        segmentName: "Część główna",
        percentage: 80,
      },
    ];
    const next = removeSegment(start, 1);
    expect(percentages(next)).toEqual([80]);
    expect(sum(next)).toBe(80);
    expect(canSaveSchema(next)).toBe(false);
  });

  it("builds the write payload and gates save at min 1%", () => {
    const items: SchemaDraftItem[] = [
      {
        segmentId: 1,
        segmentCode: "WARMUP",
        segmentName: "Rozgrzewka",
        percentage: 40,
      },
      {
        segmentId: 3,
        segmentCode: "MAIN",
        segmentName: "Część główna",
        percentage: 60,
      },
    ];
    expect(canSaveSchema(items)).toBe(true);
    expect(
      canSaveSchema([
        { ...items[0], percentage: 0 },
        { ...items[1], percentage: 100 },
      ]),
    ).toBe(false);
    expect(toSchemaWritePayload(items)).toEqual({
      items: [
        { segment_id: 1, percentage: 40 },
        { segment_id: 3, percentage: 60 },
      ],
    });
  });
});
