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

describe("schema-draft", () => {
  it("redistributes a segment increase without changing order or the source", () => {
    const start = initDraftFromSchema([], catalog);
    const before = structuredClone(start);
    const next = setSegmentPercentage(start, catalog[0].id, 98);

    expect(percentages(next)).toEqual([98, 1, 1]);
    expect(canSaveSchema(next)).toBe(true);
    expect(next.map((item) => item.segmentId)).toEqual(
      start.map((item) => item.segmentId),
    );
    expect(start).toEqual(before);
  });

  it("keeps every segment at least 1% and the sum at 100 for all slider values", () => {
    for (let count = 2; count <= 6; count++) {
      const segments = Array.from({ length: count }, (_, index) => ({
        id: index,
        code: `SEGMENT_${index}`,
        name: `Segment ${index}`,
      }));
      let items = initDraftFromSchema([], segments);
      for (const segment of segments) {
        for (const requested of [1, 15, 50, 99, 100, 20.5, -1]) {
          items = setSegmentPercentage(items, segment.id, requested);
          expect(canSaveSchema(items)).toBe(true);
          expect(items.every((item) => Number.isInteger(item.percentage))).toBe(
            true,
          );
          expect(
            items.find((item) => item.segmentId === segment.id)?.percentage,
          ).toBe(
            Math.max(1, Math.min(100 - (count - 1), Math.round(requested))),
          );
        }
      }
    }
  });

  it("keeps a single segment at 100% and ignores invalid edits", () => {
    const single = initDraftFromSchema([], [catalog[0]]);
    expect(setSegmentPercentage(single, catalog[0].id, 10)).toBe(single);
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

  it("removes a row by segment id and renormalizes to 100", () => {
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
    expect(percentages(removeSegment(start, 1))).toEqual([100]);
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
