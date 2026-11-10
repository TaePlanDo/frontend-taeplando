import { namesFor, type FilterDimension } from "@/lib/filters/definition";
import {
  AGE_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  PLANNING_FILTER_BOUNDS,
  PLANNING_FILTERS,
  type ExerciseListFilters,
} from "@/types/exercise-list-filters";

export const exerciseFilters: FilterDimension<ExerciseListFilters>[] = [
  {
    key: "name",
    fields: [{ key: "name", kind: "string" }],
    chip: (filters) => `Nazwa: ${filters.name}`,
  },
  {
    key: "status",
    fields: [{ key: "status", kind: "string", allowedValues: ["SUSPENDED"] }],
    chip: () => "Wykluczone ćwiczenia",
  },
  {
    key: "age",
    label: "Wiek",
    fields: [
      { key: "min_age", kind: "int" },
      { key: "max_age", kind: "int" },
    ],
    range: AGE_FILTER_BOUNDS,
    chip: (filters) =>
      `Wiek: ${filters.min_age ?? "…"}–${filters.max_age ?? "…"}`,
  },
  {
    key: "participants",
    label: "Liczba uczestników",
    fields: [
      { key: "min_participants", kind: "int" },
      { key: "max_participants", kind: "int" },
    ],
    range: PARTICIPANTS_FILTER_BOUNDS,
    chip: (filters) =>
      `Liczba uczestników: ${filters.min_participants ?? "…"}–${filters.max_participants ?? "…"}`,
  },
  ...PLANNING_FILTERS.map(
    ({ key, min, max, label }): FilterDimension<ExerciseListFilters> => ({
      key,
      label,
      fields: [
        { key: min, kind: "int" },
        { key: max, kind: "int" },
      ],
      range: PLANNING_FILTER_BOUNDS,
      chip: (filters) =>
        `${label}: ${filters[min] ?? "…"}–${filters[max] ?? "…"}`,
    }),
  ),
  {
    key: "equipment",
    label: "Sprzęt",
    fields: [{ key: "equipment_ids", kind: "stringCsv" }],
    chip: (filters, catalogs) =>
      `Sprzęt: ${namesFor(filters.equipment_ids, catalogs.equipment)}`,
  },
  {
    key: "trainingTypes",
    label: "Kategorie",
    fields: [{ key: "training_type_ids", kind: "stringCsv" }],
    chip: (filters, catalogs) =>
      `Kategorie: ${namesFor(filters.training_type_ids, catalogs.trainingTypes)}`,
  },
  {
    key: "segments",
    label: "Schematy",
    fields: [{ key: "segment_ids", kind: "intCsv" }],
    chip: (filters, catalogs) =>
      `Schematy: ${namesFor(filters.segment_ids, catalogs.segments)}`,
  },
];
