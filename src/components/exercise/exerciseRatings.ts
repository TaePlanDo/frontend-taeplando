import type { Exercise } from "@/types/exercise";

export type ExerciseRatingKey = keyof Pick<
  Exercise,
  | "physical_difficulty"
  | "technical_difficulty"
  | "lower_body_load"
  | "upper_body_load"
  | "core_load"
>;

export type ExerciseRatingColumn = {
  label: string;
  key: ExerciseRatingKey;
  fillClass: string;
  headerClass: string;
};

export const EXERCISE_RATINGS = {
  physical_difficulty: {
    label: "Intensywność",
    key: "physical_difficulty",
    fillClass: "bg-emerald-500 light:bg-rating-physical",
    headerClass: "text-emerald-400 light:text-rating-physical",
  },
  technical_difficulty: {
    label: "Trudność",
    key: "technical_difficulty",
    fillClass: "bg-violet-500 light:bg-rating-technical",
    headerClass: "text-violet-300 light:text-rating-technical",
  },
  upper_body_load: {
    label: "Górne partie",
    key: "upper_body_load",
    fillClass: "bg-orange-600 light:bg-rating-upper",
    headerClass: "text-orange-500 light:text-rating-upper",
  },
  lower_body_load: {
    label: "Dolne partie",
    key: "lower_body_load",
    fillClass: "bg-orange-400 light:bg-rating-lower",
    headerClass: "text-orange-400 light:text-rating-lower-text",
  },
  core_load: {
    label: "Core",
    key: "core_load",
    fillClass: "bg-orange-300 light:bg-rating-core",
    headerClass: "text-orange-300 light:text-rating-core-text",
  },
} satisfies Record<ExerciseRatingKey, ExerciseRatingColumn>;

export const EXERCISE_RATING_COLUMNS = Object.values(EXERCISE_RATINGS);

export const EXERCISE_RATING_MAX = 5;
