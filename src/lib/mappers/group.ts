import type {
  GroupDetailsFormValues,
  GroupDetailsOutput,
} from "@/lib/validation/group";
import type { Group, GroupWrite } from "@/types/group";

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
