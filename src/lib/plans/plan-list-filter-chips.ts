import { normalizeFilters } from "./plan-list-filters";
import type {
  PlanActiveFilterDimension,
  PlanListFilters,
} from "@/types/plan-list-filters";

type FilterCatalogItem = { id: string | number; name: string };

export type PlanFilterCatalogLookup = {
  equipment: FilterCatalogItem[];
  trainingTypes: FilterCatalogItem[];
  groups: FilterCatalogItem[];
};

export type PlanActiveFilterChip = {
  key: PlanActiveFilterDimension;
  label: string;
};

type FilterDimension = {
  key: PlanActiveFilterDimension;
  isActive: (filters: PlanListFilters) => boolean;
  clear: (filters: PlanListFilters) => PlanListFilters;
  label: (
    filters: PlanListFilters,
    catalogs: PlanFilterCatalogLookup,
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
  filters: PlanListFilters,
  fields: Array<keyof PlanListFilters>,
): PlanListFilters {
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
      `Wiek ${filters.min_age ?? "…"}–${filters.max_age ?? "…"}`,
  },
  {
    key: "participants",
    isActive: (filters) =>
      hasValues(filters.min_participants) ||
      hasValues(filters.max_participants),
    clear: (filters) =>
      clearFields(filters, ["min_participants", "max_participants"]),
    label: (filters) =>
      `Uczestnicy: ${filters.min_participants ?? "…"}–${filters.max_participants ?? "…"}`,
  },
  {
    key: "duration",
    isActive: (filters) =>
      hasValues(filters.min_duration) || hasValues(filters.max_duration),
    clear: (filters) => clearFields(filters, ["min_duration", "max_duration"]),
    label: (filters) =>
      `Czas: ${filters.min_duration ?? "…"}-${filters.max_duration ?? "…"} min`,
  },
  {
    key: "equipment",
    isActive: (filters) => hasValues(filters.equipment_ids),
    clear: (filters) => clearFields(filters, ["equipment_ids"]),
    label: (filters, catalogs) =>
      namesFor(filters.equipment_ids, catalogs.equipment),
  },
  {
    key: "training_types",
    isActive: (filters) => hasValues(filters.training_type_ids),
    clear: (filters) => clearFields(filters, ["training_type_ids"]),
    label: (filters, catalogs) =>
      namesFor(filters.training_type_ids, catalogs.trainingTypes),
  },
  {
    key: "groups",
    isActive: (filters) => hasValues(filters.training_group_ids),
    clear: (filters) => clearFields(filters, ["training_group_ids"]),
    label: (filters, catalogs) =>
      namesFor(filters.training_group_ids, catalogs.groups),
  },
];

export function withoutFilterDimension(
  filters: PlanListFilters,
  dimension: PlanActiveFilterDimension,
): PlanListFilters {
  return (
    FILTER_DIMENSIONS.find((entry) => entry.key === dimension)?.clear(
      filters,
    ) ?? filters
  );
}

export function countActiveFilters(
  filters: PlanListFilters,
  options?: { exclude?: PlanActiveFilterDimension[] },
): number {
  const normalized = normalizeFilters(filters);
  const excluded = new Set(options?.exclude ?? []);
  return FILTER_DIMENSIONS.filter(
    (dimension) =>
      !excluded.has(dimension.key) && dimension.isActive(normalized),
  ).length;
}

export function buildActiveFilterChips(
  filters: PlanListFilters,
  catalogs: PlanFilterCatalogLookup,
): PlanActiveFilterChip[] {
  const normalized = normalizeFilters(filters);
  return FILTER_DIMENSIONS.filter((dimension) =>
    dimension.isActive(normalized),
  ).map((dimension) => ({
    key: dimension.key,
    label: dimension.label(normalized, catalogs),
  }));
}
