import {
  AGE_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  PLANNING_FILTER_BOUNDS,
  type ExerciseListFilters,
  type PlanningFilterBound,
} from "@/types/exercise-list-filters";

import { normalizeFilters } from "./exercise-list-filters";

/** Concrete dialog draft — ranges and catalog ids always present. */
export type ExerciseFilterDraft = Record<PlanningFilterBound, number> & {
  min_age: number;
  max_age: number;
  min_participants: number;
  max_participants: number;
  excludedOnly: boolean;
  equipment_ids: string[];
  training_type_ids: string[];
  segment_ids: number[];
};

export function filtersToDraft(
  filters: ExerciseListFilters,
): ExerciseFilterDraft {
  return {
    min_physical_difficulty:
      filters.min_physical_difficulty ?? PLANNING_FILTER_BOUNDS.min,
    max_physical_difficulty:
      filters.max_physical_difficulty ?? PLANNING_FILTER_BOUNDS.max,
    min_technical_difficulty:
      filters.min_technical_difficulty ?? PLANNING_FILTER_BOUNDS.min,
    max_technical_difficulty:
      filters.max_technical_difficulty ?? PLANNING_FILTER_BOUNDS.max,
    min_upper_body_load:
      filters.min_upper_body_load ?? PLANNING_FILTER_BOUNDS.min,
    max_upper_body_load:
      filters.max_upper_body_load ?? PLANNING_FILTER_BOUNDS.max,
    min_lower_body_load:
      filters.min_lower_body_load ?? PLANNING_FILTER_BOUNDS.min,
    max_lower_body_load:
      filters.max_lower_body_load ?? PLANNING_FILTER_BOUNDS.max,
    min_core_load: filters.min_core_load ?? PLANNING_FILTER_BOUNDS.min,
    max_core_load: filters.max_core_load ?? PLANNING_FILTER_BOUNDS.max,
    min_age: filters.min_age ?? AGE_FILTER_BOUNDS.min,
    max_age: filters.max_age ?? AGE_FILTER_BOUNDS.max,
    min_participants:
      filters.min_participants ?? PARTICIPANTS_FILTER_BOUNDS.min,
    max_participants:
      filters.max_participants ?? PARTICIPANTS_FILTER_BOUNDS.max,
    excludedOnly: filters.status === "SUSPENDED",
    equipment_ids: filters.equipment_ids ?? [],
    training_type_ids: filters.training_type_ids ?? [],
    segment_ids: filters.segment_ids ?? [],
  };
}

export function emptyFilterDraft(): ExerciseFilterDraft {
  return filtersToDraft({});
}

export function draftToFilters(
  draft: ExerciseFilterDraft,
  name?: string,
): ExerciseListFilters {
  const { excludedOnly, ...otherFilters } = draft;
  return normalizeFilters({
    ...otherFilters,
    name,
    status: excludedOnly ? "SUSPENDED" : undefined,
  });
}
