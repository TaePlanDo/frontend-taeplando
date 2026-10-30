import { normalizeFilters } from "./exercise-list-filters";
import type {
  ActiveFilterDimension,
  ExerciseListFilters,
} from "@/types/exercise-list-filters";

type FilterCatalogItem = { id: string | number; name: string };

export type FilterCatalogLookup = {
  equipment: FilterCatalogItem[];
  trainingTypes: FilterCatalogItem[];
  segments: FilterCatalogItem[];
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
  catalog: FilterCatalogItem[],
): string {
  return (ids ?? [])
    .map(
      (id) =>
        catalog.find((item) => String(item.id) === String(id))?.name ??
        String(id),
    )
    .join(", ");
}

function hasValues(value: unknown): boolean {
  return Array.isArray(value)
    ? value.length > 0
    : value != null && value !== "";
}

function clearFields(
  filters: ExerciseListFilters,
  fields: Array<keyof ExerciseListFilters>,
): ExerciseListFilters {
  const next = { ...filters };
  for (const field of fields) delete next[field];
  return next;
}

const FILTER_DIMENSIONS: FilterDimension[] = [
  {
    key: "name",
    isActive: (filters) => hasValues(filters.name),
    clear: (filters) => clearFields(filters, ["name"]),
    label: (filters) => `Nazwa: ${filters.name}`,
  },
  {
    key: "age",
    isActive: (filters) =>
      hasValues(filters.min_age) || hasValues(filters.max_age),
    clear: (filters) => clearFields(filters, ["min_age", "max_age"]),
    label: (filters) =>
      `Wiek: ${filters.min_age ?? "…"}–${filters.max_age ?? "…"}`,
  },
  {
    key: "participants",
    isActive: (filters) =>
      hasValues(filters.min_participants) ||
      hasValues(filters.max_participants),
    clear: (filters) =>
      clearFields(filters, ["min_participants", "max_participants"]),
    label: (filters) =>
      `Liczba uczestników: ${filters.min_participants ?? "…"}–${filters.max_participants ?? "…"}`,
  },
  {
    key: "equipment",
    isActive: (filters) => hasValues(filters.equipment_ids),
    clear: (filters) => clearFields(filters, ["equipment_ids"]),
    label: (filters, catalogs) =>
      `Sprzęt: ${namesFor(filters.equipment_ids, catalogs.equipment)}`,
  },
  {
    key: "training_types",
    isActive: (filters) => hasValues(filters.training_type_ids),
    clear: (filters) => clearFields(filters, ["training_type_ids"]),
    label: (filters, catalogs) =>
      `Kategorie: ${namesFor(filters.training_type_ids, catalogs.trainingTypes)}`,
  },
  {
    key: "segments",
    isActive: (filters) => hasValues(filters.segment_ids),
    clear: (filters) => clearFields(filters, ["segment_ids"]),
    label: (filters, catalogs) =>
      `Schematy: ${namesFor(filters.segment_ids, catalogs.segments)}`,
  },
];

export function withoutFilterDimension(
  filters: ExerciseListFilters,
  dimension: ActiveFilterDimension,
): ExerciseListFilters {
  return (
    FILTER_DIMENSIONS.find((entry) => entry.key === dimension)?.clear(
      filters,
    ) ?? filters
  );
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
