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
  shortLabel: string;
  key: ExerciseRatingKey;
  fillClass: string;
  headerClass: string;
};

export const EXERCISE_RATING_COLUMNS: ExerciseRatingColumn[] = [
  {
    label: "Intensywność",
    shortLabel: "Intens.",
    key: "physical_difficulty",
    fillClass: "bg-emerald-500",
    headerClass: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  },
  {
    label: "Trudność",
    shortLabel: "Trud.",
    key: "technical_difficulty",
    fillClass: "bg-violet-500",
    headerClass: "border-violet-500/50 bg-violet-500/15 text-violet-300",
  },
  {
    label: "Górne partie",
    shortLabel: "Górne",
    key: "upper_body_load",
    fillClass: "bg-orange-600",
    headerClass: "border-orange-600/50 bg-orange-600/15 text-orange-500",
  },
  {
    label: "Dolne partie",
    shortLabel: "Dolne",
    key: "lower_body_load",
    fillClass: "bg-orange-400",
    headerClass: "border-orange-400/50 bg-orange-400/15 text-orange-400",
  },
  {
    label: "Core",
    shortLabel: "Core",
    key: "core_load",
    fillClass: "bg-orange-300",
    headerClass: "border-orange-300/50 bg-orange-300/15 text-orange-300",
  },
];

export const EXERCISE_RATING_MAX = 5;
