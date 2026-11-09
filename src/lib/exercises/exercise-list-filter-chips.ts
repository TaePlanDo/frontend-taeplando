import {
  buildActiveFilterChips as buildChips,
  countActiveFilters as countChips,
  namesFor,
  withoutFilterDimension as withoutChips,
  type DimensionSpec,
  type FilterCatalogs,
} from "@/lib/filters/chips";
import type {
  ActiveFilterDimension,
  ExerciseListFilters,
} from "@/types/exercise-list-filters";

import { normalizeFilters } from "./exercise-list-filters";

export type ActiveFilterChip = { key: ActiveFilterDimension; label: string };

const DIMENSIONS: DimensionSpec<ExerciseListFilters>[] = [
  {
    key: "name",
    fields: ["name"],
    label: (filters) => `Nazwa: ${filters.name}`,
  },
  {
    key: "age",
    fields: ["min_age", "max_age"],
    label: (filters) =>
      `Wiek: ${filters.min_age ?? "…"}–${filters.max_age ?? "…"}`,
  },
  {
    key: "participants",
    fields: ["min_participants", "max_participants"],
    label: (filters) =>
      `Liczba uczestników: ${filters.min_participants ?? "…"}–${filters.max_participants ?? "…"}`,
  },
  {
    key: "equipment",
    fields: ["equipment_ids"],
    label: (filters, catalogs) =>
      `Sprzęt: ${namesFor(filters.equipment_ids, catalogs.equipment)}`,
  },
  {
    key: "training_types",
    fields: ["training_type_ids"],
    label: (filters, catalogs) =>
      `Kategorie: ${namesFor(filters.training_type_ids, catalogs.trainingTypes)}`,
  },
  {
    key: "segments",
    fields: ["segment_ids"],
    label: (filters, catalogs) =>
      `Schematy: ${namesFor(filters.segment_ids, catalogs.segments)}`,
  },
];

export function withoutFilterDimension(
  filters: ExerciseListFilters,
  dimension: string,
): ExerciseListFilters {
  return withoutChips(normalizeFilters(filters), DIMENSIONS, dimension);
}

export function countActiveFilters(
  filters: ExerciseListFilters,
  options?: { exclude?: string[] },
): number {
  return countChips(normalizeFilters(filters), DIMENSIONS, options);
}

export function buildActiveFilterChips(
  filters: ExerciseListFilters,
  catalogs: FilterCatalogs,
): ActiveFilterChip[] {
  return buildChips(
    normalizeFilters(filters),
    DIMENSIONS,
    catalogs,
  ) as ActiveFilterChip[];
}
