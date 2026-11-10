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
};

export const EXERCISE_RATING_COLUMNS: ExerciseRatingColumn[] = [
  {
    label: "Intensywność",
    key: "physical_difficulty",
    fillClass: "bg-emerald-500",
  },
  {
    label: "Trudność",
    key: "technical_difficulty",
    fillClass: "bg-violet-500",
  },
  {
    label: "Górne partie",
    key: "upper_body_load",
    fillClass: "bg-orange-600",
  },
  {
    label: "Dolne partie",
    key: "lower_body_load",
    fillClass: "bg-orange-400",
  },
  {
    label: "Core",
    key: "core_load",
    fillClass: "bg-orange-300",
  },
];

export const EXERCISE_RATING_MAX = 5;
