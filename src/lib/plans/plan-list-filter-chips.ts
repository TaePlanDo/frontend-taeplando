import {
  buildActiveFilterChips as buildChips,
  countActiveFilters as countChips,
  namesFor,
  withoutFilterDimension as withoutChips,
  type DimensionSpec,
  type FilterCatalogs,
} from "@/lib/filters/chips";
import type {
  PlanActiveFilterDimension,
  PlanListFilters,
} from "@/types/plan-list-filters";

import { normalizeFilters } from "./plan-list-filters";

export type PlanActiveFilterChip = {
  key: PlanActiveFilterDimension;
  label: string;
};

const DIMENSIONS: DimensionSpec<PlanListFilters>[] = [
  {
    key: "name",
    fields: ["name"],
    label: (filters) => `Nazwa: ${filters.name}`,
  },
  {
    key: "age",
    fields: ["min_age", "max_age"],
    label: (filters) =>
      `Wiek ${filters.min_age ?? "…"}–${filters.max_age ?? "…"}`,
  },
  {
    key: "participants",
    fields: ["min_participants", "max_participants"],
    label: (filters) =>
      `Uczestnicy: ${filters.min_participants ?? "…"}–${filters.max_participants ?? "…"}`,
  },
  {
    key: "duration",
    fields: ["min_duration", "max_duration"],
    label: (filters) =>
      `Czas: ${filters.min_duration ?? "…"}-${filters.max_duration ?? "…"} min`,
  },
  {
    key: "equipment",
    fields: ["equipment_ids"],
    label: (filters, catalogs) =>
      namesFor(filters.equipment_ids, catalogs.equipment),
  },
  {
    key: "training_types",
    fields: ["training_type_ids"],
    label: (filters, catalogs) =>
      namesFor(filters.training_type_ids, catalogs.trainingTypes),
  },
  {
    key: "groups",
    fields: ["training_group_ids"],
    label: (filters, catalogs) =>
      namesFor(filters.training_group_ids, catalogs.groups),
  },
];

export function withoutFilterDimension(
  filters: PlanListFilters,
  dimension: string,
): PlanListFilters {
  return withoutChips(normalizeFilters(filters), DIMENSIONS, dimension);
}

export function countActiveFilters(
  filters: PlanListFilters,
  options?: { exclude?: string[] },
): number {
  return countChips(normalizeFilters(filters), DIMENSIONS, options);
}

export function buildActiveFilterChips(
  filters: PlanListFilters,
  catalogs: FilterCatalogs,
): PlanActiveFilterChip[] {
  return buildChips(
    normalizeFilters(filters),
    DIMENSIONS,
    catalogs,
  ) as PlanActiveFilterChip[];
}
