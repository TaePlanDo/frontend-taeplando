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
    fillClass: "bg-emerald-500 light:bg-[#008765]",
    headerClass: "text-emerald-400 light:text-[#008765]",
  },
  technical_difficulty: {
    label: "Trudność",
    key: "technical_difficulty",
    fillClass: "bg-violet-500 light:bg-[#7540c9]",
    headerClass: "text-violet-300 light:text-[#7540c9]",
  },
  upper_body_load: {
    label: "Górne partie",
    key: "upper_body_load",
    fillClass: "bg-orange-600 light:bg-[#c43d20]",
    headerClass: "text-orange-500 light:text-[#c43d20]",
  },
  lower_body_load: {
    label: "Dolne partie",
    key: "lower_body_load",
    fillClass: "bg-orange-400 light:bg-[#ce5f00]",
    headerClass: "text-orange-400 light:text-[#b85300]",
  },
  core_load: {
    label: "Core",
    key: "core_load",
    fillClass: "bg-orange-300 light:bg-[#ac7600]",
    headerClass: "text-orange-300 light:text-[#946500]",
  },
} satisfies Record<ExerciseRatingKey, ExerciseRatingColumn>;

export const EXERCISE_RATING_COLUMNS = Object.values(EXERCISE_RATINGS);

export const EXERCISE_RATING_MAX = 5;
