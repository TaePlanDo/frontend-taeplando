import {
  AGE_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  type ExerciseListFilters,
} from "@/types/exercise-list-filters";

import { normalizeFilters } from "./exercise-list-filters";

/** Concrete dialog draft — ranges and catalog ids always present. */
export type ExerciseFilterDraft = {
  min_age: number;
  max_age: number;
  min_participants: number;
  max_participants: number;
  equipment_ids: string[];
  training_type_ids: string[];
  segment_ids: number[];
};

export function filtersToDraft(
  filters: ExerciseListFilters,
): ExerciseFilterDraft {
  return {
    min_age: filters.min_age ?? AGE_FILTER_BOUNDS.min,
    max_age: filters.max_age ?? AGE_FILTER_BOUNDS.max,
    min_participants:
      filters.min_participants ?? PARTICIPANTS_FILTER_BOUNDS.min,
    max_participants:
      filters.max_participants ?? PARTICIPANTS_FILTER_BOUNDS.max,
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
  return normalizeFilters({ ...draft, name });
}
