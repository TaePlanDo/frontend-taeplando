import { EXERCISE_RATINGS } from "@/components/exercise/exerciseRatings";

export const PLAN_RATING_COLUMNS = [
  EXERCISE_RATINGS.physical_difficulty,
  EXERCISE_RATINGS.technical_difficulty,
  EXERCISE_RATINGS.upper_body_load,
  EXERCISE_RATINGS.lower_body_load,
  EXERCISE_RATINGS.core_load,
];

export const PLAN_RATING_GRID_CLASS = "grid grid-cols-5 gap-1.5";
