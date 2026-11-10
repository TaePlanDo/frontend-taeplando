import type {
  GroupDetailsFormValues,
  GroupDetailsOutput,
} from "@/lib/validation/group";
import type { Group, GroupSchemaItem, GroupWrite } from "@/types/group";
import type { PlanSchemaSnapshotItem } from "@/types/plan";

/** Coerce API schema percentages (often Decimal strings) to numbers. */
export function normalizeGroup(group: Group): Group {
  return {
    ...group,
    schema: group.schema.map((item) => ({
      ...item,
      percentage: Number(item.percentage),
    })),
  };
}

export function toPlanSchemaSnapshot(
  schema: GroupSchemaItem[],
): PlanSchemaSnapshotItem[] {
  return schema.map((item) => ({
    position: item.position,
    segment_id: item.segment_id,
    code: item.segment_code,
    name: item.segment_name,
    percentage: item.percentage,
  }));
}

export function toFormValues(group?: Group | null): GroupDetailsFormValues {
  if (!group) {
    return { name: "", minAge: "", maxAge: "", hours: "0", minutes: "0" };
  }
  return {
    name: group.name,
    minAge: String(group.min_age),
    maxAge: String(group.max_age),
    hours: String(Math.floor(group.duration_minutes / 60)),
    minutes: String(group.duration_minutes % 60),
  };
}

export function toGroupWrite(values: GroupDetailsOutput): GroupWrite {
  return {
    name: values.name,
    min_age: values.minAge,
    max_age: values.maxAge,
    duration_minutes: values.hours * 60 + values.minutes,
  };
}
