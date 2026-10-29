import type {
  ActiveFilterDimension,
  ExerciseListFilters,
} from "@/types/exercise-list-filters";

import { normalizeFilters } from "./exercise-list-filters";

export type FilterCatalogLookup = {
  equipment: { id: string | number; name: string }[];
  trainingTypes: { id: string | number; name: string }[];
  segments: { id: string | number; name: string }[];
};

export type ActiveFilterChip = {
  key: ActiveFilterDimension;
  label: string;
};

type FilterDimension = {
  key: ActiveFilterDimension;
  isActive: (filters: ExerciseListFilters) => boolean;
  clear: (filters: ExerciseListFilters) => ExerciseListFilters;
  label: (
    filters: ExerciseListFilters,
    catalogs: FilterCatalogLookup,
  ) => string;
};

function namesFor(
  ids: Array<string | number> | undefined,
  catalog: { id: string | number; name: string }[],
): string {
  if (!ids?.length) return "";
  return ids
    .map((id) => {
      const match = catalog.find((item) => String(item.id) === String(id));
      return match?.name ?? String(id);
    })
    .join(", ");
}

function omitKeys(
  filters: ExerciseListFilters,
  keys: (keyof ExerciseListFilters)[],
): ExerciseListFilters {
  const next = { ...filters };
  for (const key of keys) delete next[key];
  return next;
}

export const FILTER_DIMENSIONS: FilterDimension[] = [
  {
    key: "name",
    isActive: (filters) => Boolean(filters.name?.trim()),
    clear: (filters) => omitKeys(filters, ["name"]),
    label: (filters) => `Nazwa: ${filters.name!.trim()}`,
  },
  {
    key: "age",
    isActive: (filters) => filters.min_age != null || filters.max_age != null,
    clear: (filters) => omitKeys(filters, ["min_age", "max_age"]),
    label: (filters) =>
      `Wiek: ${filters.min_age ?? "…"}–${filters.max_age ?? "…"}`,
  },
  {
    key: "participants",
    isActive: (filters) =>
      filters.min_participants != null || filters.max_participants != null,
    clear: (filters) =>
      omitKeys(filters, ["min_participants", "max_participants"]),
    label: (filters) =>
      `Liczba uczestników: ${filters.min_participants ?? "…"}–${filters.max_participants ?? "…"}`,
  },
  {
    key: "equipment",
    isActive: (filters) => Boolean(filters.equipment_ids?.length),
    clear: (filters) => omitKeys(filters, ["equipment_ids"]),
    label: (filters, catalogs) =>
      `Sprzęt: ${namesFor(filters.equipment_ids, catalogs.equipment)}`,
  },
  {
    key: "training_types",
    isActive: (filters) => Boolean(filters.training_type_ids?.length),
    clear: (filters) => omitKeys(filters, ["training_type_ids"]),
    label: (filters, catalogs) =>
      `Kategorie: ${namesFor(filters.training_type_ids, catalogs.trainingTypes)}`,
  },
  {
    key: "segments",
    isActive: (filters) => Boolean(filters.segment_ids?.length),
    clear: (filters) => omitKeys(filters, ["segment_ids"]),
    label: (filters, catalogs) =>
      `Schematy: ${namesFor(filters.segment_ids, catalogs.segments)}`,
  },
];

export function withoutFilterDimension(
  filters: ExerciseListFilters,
  dimension: ActiveFilterDimension,
): ExerciseListFilters {
  const def = FILTER_DIMENSIONS.find((entry) => entry.key === dimension);
  return def ? def.clear(filters) : filters;
}

export function countActiveFilters(
  filters: ExerciseListFilters,
  options?: { exclude?: ActiveFilterDimension[] },
): number {
  const normalized = normalizeFilters(filters);
  const excluded = new Set(options?.exclude ?? []);
  return FILTER_DIMENSIONS.filter(
    (dimension) =>
      !excluded.has(dimension.key) && dimension.isActive(normalized),
  ).length;
}

export function buildActiveFilterChips(
  filters: ExerciseListFilters,
  catalogs: FilterCatalogLookup,
): ActiveFilterChip[] {
  const normalized = normalizeFilters(filters);
  return FILTER_DIMENSIONS.filter((dimension) =>
    dimension.isActive(normalized),
  ).map((dimension) => ({
    key: dimension.key,
    label: dimension.label(normalized, catalogs),
  }));
}
