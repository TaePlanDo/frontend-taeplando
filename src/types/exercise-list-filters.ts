export type ExerciseListFilters = {
  name?: string;
  min_age?: number;
  max_age?: number;
  min_participants?: number;
  max_participants?: number;
  min_physical_difficulty?: number;
  max_physical_difficulty?: number;
  min_technical_difficulty?: number;
  max_technical_difficulty?: number;
  min_upper_body_load?: number;
  max_upper_body_load?: number;
  min_lower_body_load?: number;
  max_lower_body_load?: number;
  min_core_load?: number;
  max_core_load?: number;
  equipment_ids?: string[];
  training_type_ids?: string[];
  segment_ids?: number[];
};

export type PlanningFilterDimension =
  | "physical_difficulty"
  | "technical_difficulty"
  | "upper_body_load"
  | "lower_body_load"
  | "core_load";
export type ActiveFilterDimension =
  | "name"
  | "age"
  | "participants"
  | "equipment"
  | "training_types"
  | "segments"
  | PlanningFilterDimension;

export const PLANNING_FILTERS = [
  {
    key: "physical_difficulty",
    min: "min_physical_difficulty",
    max: "max_physical_difficulty",
    label: "Intensywność fizyczna",
  },
  {
    key: "technical_difficulty",
    min: "min_technical_difficulty",
    max: "max_technical_difficulty",
    label: "Trudność techniczna",
  },
  {
    key: "upper_body_load",
    min: "min_upper_body_load",
    max: "max_upper_body_load",
    label: "Zaangażowanie górnych partii",
  },
  {
    key: "lower_body_load",
    min: "min_lower_body_load",
    max: "max_lower_body_load",
    label: "Zaangażowanie dolnych partii",
  },
  {
    key: "core_load",
    min: "min_core_load",
    max: "max_core_load",
    label: "Zaangażowanie partii core",
  },
] as const;

export const AGE_FILTER_BOUNDS = { min: 1, max: 99 } as const;
export const PARTICIPANTS_FILTER_BOUNDS = { min: 1, max: 99 } as const;
export const PLANNING_FILTER_BOUNDS = { min: 1, max: 5 } as const;
