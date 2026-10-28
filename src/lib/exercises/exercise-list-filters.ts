import {
  AGE_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  type ExerciseListFilters,
} from "@/types/exercise-list-filters";

type RangeBounds = { min: number; max: number };

type FilterQueryField =
  | { key: "name"; kind: "string" }
  | {
      key: "min_age" | "max_age" | "min_participants" | "max_participants";
      kind: "int";
    }
  | { key: "equipment_ids" | "training_type_ids"; kind: "stringCsv" }
  | { key: "segment_ids"; kind: "intCsv" };

const FILTER_QUERY_FIELDS: FilterQueryField[] = [
  { key: "name", kind: "string" },
  { key: "min_age", kind: "int" },
  { key: "max_age", kind: "int" },
  { key: "min_participants", kind: "int" },
  { key: "max_participants", kind: "int" },
  { key: "equipment_ids", kind: "stringCsv" },
  { key: "training_type_ids", kind: "stringCsv" },
  { key: "segment_ids", kind: "intCsv" },
];

export function parsePositiveInt(raw: string | null): number | undefined {
  if (raw == null || raw === "") return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) return undefined;
  return value;
}

function parseStringCsv(raw: string | null): string[] | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const values = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

function parseIntCsv(raw: string | null): number[] | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const values: number[] = [];
  for (const part of raw.split(",")) {
    const token = part.trim();
    if (!token) continue;
    const value = Number(token);
    if (!Number.isInteger(value)) continue;
    values.push(value);
  }
  return values.length > 0 ? values : undefined;
}

function isFullRange(
  min: number | undefined,
  max: number | undefined,
  bounds: RangeBounds,
): boolean {
  return min === bounds.min && max === bounds.max;
}

/** Drop empties and full default ranges so URL/API stay lean. */
export function normalizeFilters(
  filters: ExerciseListFilters,
): ExerciseListFilters {
  const next: ExerciseListFilters = {};
  const name = filters.name?.trim();
  if (name) next.name = name;

  if (!isFullRange(filters.min_age, filters.max_age, AGE_FILTER_BOUNDS)) {
    if (filters.min_age != null) next.min_age = filters.min_age;
    if (filters.max_age != null) next.max_age = filters.max_age;
  }

  if (
    !isFullRange(
      filters.min_participants,
      filters.max_participants,
      PARTICIPANTS_FILTER_BOUNDS,
    )
  ) {
    if (filters.min_participants != null) {
      next.min_participants = filters.min_participants;
    }
    if (filters.max_participants != null) {
      next.max_participants = filters.max_participants;
    }
  }

  if (filters.equipment_ids?.length) next.equipment_ids = filters.equipment_ids;
  if (filters.training_type_ids?.length) {
    next.training_type_ids = filters.training_type_ids;
  }
  if (filters.segment_ids?.length) next.segment_ids = filters.segment_ids;
  return next;
}

/** Shared filter query keys for URL and API (no pagination). */
export function appendExerciseListFilters(
  params: URLSearchParams,
  filters: ExerciseListFilters,
): void {
  const normalized = normalizeFilters(filters);

  for (const field of FILTER_QUERY_FIELDS) {
    if (field.kind === "string") {
      const value = normalized[field.key];
      if (value) params.set(field.key, value);
      continue;
    }
    if (field.kind === "int") {
      const value = normalized[field.key];
      if (value != null) params.set(field.key, String(value));
      continue;
    }
    if (field.kind === "stringCsv") {
      const value = normalized[field.key];
      if (value?.length) params.set(field.key, value.join(","));
      continue;
    }
    const value = normalized[field.key];
    if (value?.length) params.set(field.key, value.join(","));
  }
}

export function parseExerciseListFilters(
  params: URLSearchParams,
): ExerciseListFilters {
  const parsed: ExerciseListFilters = {};

  for (const field of FILTER_QUERY_FIELDS) {
    if (field.kind === "string") {
      const value = params.get(field.key)?.trim() || undefined;
      if (value) parsed[field.key] = value;
      continue;
    }
    if (field.kind === "int") {
      const value = parsePositiveInt(params.get(field.key));
      if (value != null) parsed[field.key] = value;
      continue;
    }
    if (field.kind === "stringCsv") {
      const value = parseStringCsv(params.get(field.key));
      if (value) parsed[field.key] = value;
      continue;
    }
    const value = parseIntCsv(params.get(field.key));
    if (value) parsed[field.key] = value;
  }

  return normalizeFilters(parsed);
}
