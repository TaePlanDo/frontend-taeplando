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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export const EXERCISE_LIST_FILTER_PARAM_KEYS = FILTER_QUERY_FIELDS.map(
  ({ key }) => key,
);

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
    .filter((value) => UUID_PATTERN.test(value));
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

function isValidBound(value: number | undefined, bounds: RangeBounds): boolean {
  return (
    value != null &&
    Number.isInteger(value) &&
    value >= bounds.min &&
    value <= bounds.max
  );
}

function normalizeRange(
  min: number | undefined,
  max: number | undefined,
  bounds: RangeBounds,
): { min?: number; max?: number } {
  const normalizedMin = isValidBound(min, bounds) ? min : undefined;
  const normalizedMax = isValidBound(max, bounds) ? max : undefined;

  if (
    normalizedMin != null &&
    normalizedMax != null &&
    normalizedMin > normalizedMax
  ) {
    return {};
  }

  return { min: normalizedMin, max: normalizedMax };
}

function uniqueValues<T>(values: T[]): T[] {
  return [...new Set(values)];
}

/** Drop empties and full default ranges so URL/API stay lean. */
export function normalizeFilters(
  filters: ExerciseListFilters,
): ExerciseListFilters {
  const next: ExerciseListFilters = {};
  const name = filters.name?.trim();
  if (name) next.name = name;

  const age = normalizeRange(
    filters.min_age,
    filters.max_age,
    AGE_FILTER_BOUNDS,
  );
  if (!isFullRange(age.min, age.max, AGE_FILTER_BOUNDS)) {
    if (age.min != null) next.min_age = age.min;
    if (age.max != null) next.max_age = age.max;
  }

  const participants = normalizeRange(
    filters.min_participants,
    filters.max_participants,
    PARTICIPANTS_FILTER_BOUNDS,
  );
  if (
    !isFullRange(participants.min, participants.max, PARTICIPANTS_FILTER_BOUNDS)
  ) {
    if (participants.min != null) {
      next.min_participants = participants.min;
    }
    if (participants.max != null) {
      next.max_participants = participants.max;
    }
  }

  if (filters.equipment_ids?.length) {
    next.equipment_ids = uniqueValues(filters.equipment_ids);
  }
  if (filters.training_type_ids?.length) {
    next.training_type_ids = uniqueValues(filters.training_type_ids);
  }
  if (filters.segment_ids?.length) {
    next.segment_ids = uniqueValues(filters.segment_ids);
  }
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
