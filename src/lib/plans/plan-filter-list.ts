import { namesFor, type FilterDimension } from "@/lib/filters/definition";
import {
  AGE_FILTER_BOUNDS,
  DURATION_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  type PlanListFilters,
} from "@/types/plan-list-filters";

export const planFilters: FilterDimension<PlanListFilters>[] = [
  {
    key: "name",
    fields: [{ key: "name", kind: "string" }],
    chip: (filters) => `Nazwa: ${filters.name}`,
  },
  {
    key: "age",
    label: "Wiek uczestników",
    fields: [
      { key: "min_age", kind: "int" },
      { key: "max_age", kind: "int" },
    ],
    range: AGE_FILTER_BOUNDS,
    chip: (filters) =>
      `Wiek ${filters.min_age ?? "…"}-${filters.max_age ?? "…"}`,
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
      `Uczestnicy: ${filters.min_participants ?? "…"}–${filters.max_participants ?? "…"}`,
  },
  {
    key: "duration",
    label: "Czas trwania",
    fields: [
      { key: "min_duration", kind: "int" },
      { key: "max_duration", kind: "int" },
    ],
    range: DURATION_FILTER_BOUNDS,
    chip: (filters) =>
      `Czas: ${filters.min_duration ?? "…"}-${filters.max_duration ?? "…"} min`,
  },
  {
    key: "equipment",
    label: "Sprzęt",
    fields: [{ key: "equipment_ids", kind: "stringCsv" }],
    chip: (filters, catalogs) =>
      namesFor(filters.equipment_ids, catalogs.equipment),
  },
  {
    key: "trainingTypes",
    label: "Kategorie",
    fields: [{ key: "training_type_ids", kind: "stringCsv" }],
    chip: (filters, catalogs) =>
      namesFor(filters.training_type_ids, catalogs.trainingTypes),
  },
  {
    key: "groups",
    fields: [{ key: "training_group_ids", kind: "stringCsv" }],
    chip: (filters, catalogs) =>
      namesFor(filters.training_group_ids, catalogs.groups),
  },
];
