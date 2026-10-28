export type ExerciseListFilters = {
  name?: string;
  min_age?: number;
  max_age?: number;
  min_participants?: number;
  max_participants?: number;
  equipment_ids?: string[];
  training_type_ids?: string[];
  segment_ids?: number[];
};

export type ActiveFilterDimension =
  "name" | "age" | "participants" | "equipment" | "training_types" | "segments";

export const AGE_FILTER_BOUNDS = { min: 0, max: 99 } as const;
export const PARTICIPANTS_FILTER_BOUNDS = { min: 1, max: 99 } as const;
