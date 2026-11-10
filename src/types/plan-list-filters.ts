export type PlanListFilters = {
  name?: string;
  min_age?: number;
  max_age?: number;
  min_participants?: number;
  max_participants?: number;
  min_duration?: number;
  max_duration?: number;
  equipment_ids?: string[];
  training_type_ids?: string[];
  training_group_ids?: string[];
};

export const AGE_FILTER_BOUNDS = { min: 0, max: 99 } as const;
export const PARTICIPANTS_FILTER_BOUNDS = { min: 1, max: 99 } as const;
export const DURATION_FILTER_BOUNDS = { min: 15, max: 120 } as const;
