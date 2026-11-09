import {
  AGE_FILTER_BOUNDS,
  DURATION_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  type PlanListFilters,
} from "@/types/plan-list-filters";

import { normalizeFilters } from "./plan-list-filters";

export type PlanFilterDraft = {
  min_age: number;
  max_age: number;
  min_participants: number;
  max_participants: number;
  min_duration: number;
  max_duration: number;
  equipment_ids: string[];
  training_type_ids: string[];
  training_group_ids: string[];
};

export function filtersToDraft(filters: PlanListFilters): PlanFilterDraft {
  return {
    min_age: filters.min_age ?? AGE_FILTER_BOUNDS.min,
    max_age: filters.max_age ?? AGE_FILTER_BOUNDS.max,
    min_participants:
      filters.min_participants ?? PARTICIPANTS_FILTER_BOUNDS.min,
    max_participants:
      filters.max_participants ?? PARTICIPANTS_FILTER_BOUNDS.max,
    min_duration: filters.min_duration ?? DURATION_FILTER_BOUNDS.min,
    max_duration: filters.max_duration ?? DURATION_FILTER_BOUNDS.max,
    equipment_ids: filters.equipment_ids ?? [],
    training_type_ids: filters.training_type_ids ?? [],
    training_group_ids: filters.training_group_ids ?? [],
  };
}

export function emptyFilterDraft(): PlanFilterDraft {
  return filtersToDraft({});
}

export function draftToFilters(
  draft: PlanFilterDraft,
  name?: string,
): PlanListFilters {
  return normalizeFilters({ ...draft, name });
}
