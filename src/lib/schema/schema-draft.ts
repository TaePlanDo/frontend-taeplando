import { normalizeRatios } from "@/components/ratio-balancer/use-ratio-balancer";
import type { GroupSchemaItem } from "@/types/group";
import type { TrainingSegment } from "@/types/training-segment";

export type SchemaDraftItem = {
  segmentId: number;
  segmentCode: string;
  segmentName: string;
  percentage: number;
};

function withNormalizedPercentages(
  items: SchemaDraftItem[],
): SchemaDraftItem[] {
  if (items.length === 0) {
    return [];
  }
  const ratios = normalizeRatios(items.map((item) => item.percentage));
  return items.map((item, index) => ({
    ...item,
    percentage: ratios[index]!,
  }));
}

export function initDraftFromSchema(
  schema: GroupSchemaItem[],
  catalog: TrainingSegment[],
): SchemaDraftItem[] {
  if (schema.length === 0) {
    if (catalog.length === 0) {
      return [];
    }
    return withNormalizedPercentages(
      catalog.map((segment) => ({
        segmentId: segment.id,
        segmentCode: segment.code,
        segmentName: segment.name,
        percentage: 1,
      })),
    );
  }

  return withNormalizedPercentages(
    [...schema]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        segmentId: item.segment_id,
        segmentCode: item.segment_code,
        segmentName: item.segment_name,
        percentage: item.percentage,
      })),
  );
}

/** Append an unused catalog segment at 1%, taking that 1% from the largest row. */
export function addSegment(
  items: SchemaDraftItem[],
  segment: TrainingSegment,
): SchemaDraftItem[] {
  if (items.some((item) => item.segmentId === segment.id)) {
    return items;
  }

  if (items.length === 0) {
    return [
      {
        segmentId: segment.id,
        segmentCode: segment.code,
        segmentName: segment.name,
        percentage: 100,
      },
    ];
  }

  const next = items.map((item) => ({ ...item }));
  let biggest = 0;
  for (let i = 1; i < next.length; i++) {
    if (next[i].percentage > next[biggest].percentage) {
      biggest = i;
    }
  }
  if (next[biggest].percentage <= 1) {
    return items;
  }

  next[biggest].percentage -= 1;
  next.push({
    segmentId: segment.id,
    segmentCode: segment.code,
    segmentName: segment.name,
    percentage: 1,
  });
  return next;
}

export function removeSegment(
  items: SchemaDraftItem[],
  segmentCode: string,
): SchemaDraftItem[] {
  if (items.length <= 1) {
    return items;
  }
  const next = items.filter((item) => item.segmentCode !== segmentCode);
  if (next.length === items.length) {
    return items;
  }
  return withNormalizedPercentages(next);
}

export function applyRatios(
  items: SchemaDraftItem[],
  ratios: number[],
): SchemaDraftItem[] {
  if (ratios.length !== items.length) {
    return items;
  }
  return items.map((item, index) => ({
    ...item,
    percentage: ratios[index]!,
  }));
}

export function reorderSegments(
  items: SchemaDraftItem[],
  fromIndex: number,
  toIndex: number,
): SchemaDraftItem[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function canSaveSchema(items: SchemaDraftItem[]): boolean {
  if (items.length === 0) {
    return false;
  }
  const sum = items.reduce((total, item) => total + item.percentage, 0);
  return sum === 100 && items.every((item) => item.percentage >= 1);
}

export function toSchemaWritePayload(items: SchemaDraftItem[]) {
  return {
    items: items.map((item) => ({
      segment_id: item.segmentId,
      percentage: item.percentage,
    })),
  };
}
