import { normalizeRatios } from "@/components/ui/hairline/ratio-balancer/use-ratio-balancer";
import { GROUP_SCHEMA_LIMITS } from "@/lib/constants/group";
import type { GroupSchemaItem, GroupSchemaWrite } from "@/types/group";
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

/** Use the free pool first; a fully allocated schema donates from its largest row. */
export function addSegment(
  items: SchemaDraftItem[],
  segment: TrainingSegment,
): SchemaDraftItem[] {
  if (items.some((item) => item.segmentId === segment.id)) {
    return items;
  }

  const { MIN_PERCENTAGE, TOTAL_PERCENTAGE } = GROUP_SCHEMA_LIMITS;
  const added: SchemaDraftItem = {
    segmentId: segment.id,
    segmentCode: segment.code,
    segmentName: segment.name,
    percentage: MIN_PERCENTAGE,
  };
  if (items.length === 0) {
    return [{ ...added, percentage: TOTAL_PERCENTAGE }];
  }
  if (getSchemaTotal(items) + added.percentage <= TOTAL_PERCENTAGE) {
    return [...items, added];
  }

  const next = items.map((item) => ({ ...item }));
  let biggest = 0;
  for (let i = 1; i < next.length; i++) {
    if (next[i].percentage > next[biggest].percentage) {
      biggest = i;
    }
  }
  if (next[biggest].percentage < MIN_PERCENTAGE + added.percentage) {
    return items;
  }

  next[biggest].percentage -= added.percentage;
  return [...next, added];
}

export function removeSegment(
  items: SchemaDraftItem[],
  segmentId: number,
): SchemaDraftItem[] {
  if (items.length <= 1) {
    return items;
  }
  const next = items.filter((item) => item.segmentId !== segmentId);
  if (next.length === items.length) {
    return items;
  }
  if (getSchemaTotal(items) < GROUP_SCHEMA_LIMITS.TOTAL_PERCENTAGE) {
    return next;
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

/** Edit only this segment, limiting increases to the remaining percentage pool. */
export function setSegmentPercentage(
  items: SchemaDraftItem[],
  segmentId: number,
  percentage: number,
): SchemaDraftItem[] {
  if (!Number.isFinite(percentage)) return items;
  const target = items.find((item) => item.segmentId === segmentId);
  if (!target) return items;

  const { MIN_PERCENTAGE, TOTAL_PERCENTAGE } = GROUP_SCHEMA_LIMITS;
  const bounded = Math.max(
    MIN_PERCENTAGE,
    Math.min(
      TOTAL_PERCENTAGE - getSchemaTotal(items) + target.percentage,
      Math.round(percentage),
    ),
  );
  if (bounded === target.percentage) return items;

  return items.map((item) =>
    item.segmentId === segmentId ? { ...item, percentage: bounded } : item,
  );
}

export function getSchemaTotal(items: SchemaDraftItem[]): number {
  return items.reduce((total, item) => total + item.percentage, 0);
}

export function canSaveSchema(items: SchemaDraftItem[]): boolean {
  if (items.length === 0) {
    return false;
  }
  return (
    getSchemaTotal(items) === GROUP_SCHEMA_LIMITS.TOTAL_PERCENTAGE &&
    items.every((item) => item.percentage >= GROUP_SCHEMA_LIMITS.MIN_PERCENTAGE)
  );
}

export function toSchemaWritePayload(
  items: SchemaDraftItem[],
): GroupSchemaWrite {
  return {
    items: items.map((item) => ({
      segment_id: item.segmentId,
      percentage: item.percentage,
    })),
  };
}
