import type { PlanExercise } from "@/types/plan";

export type PlanRatingKey = keyof Pick<
  PlanExercise,
  | "physical_difficulty_snapshot"
  | "technical_difficulty_snapshot"
  | "lower_body_load_snapshot"
  | "upper_body_load_snapshot"
  | "core_load_snapshot"
>;

export type PlanRatingColumn = {
  label: string;
  key: PlanRatingKey;
  fillClass: string;
  headerClass: string;
};

export const PLAN_RATING_COLUMNS: PlanRatingColumn[] = [
  {
    label: "Intensywność",
    key: "physical_difficulty_snapshot",
    fillClass: "bg-emerald-500",
    headerClass: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  },
  {
    label: "Trudność",
    key: "technical_difficulty_snapshot",
    fillClass: "bg-violet-500",
    headerClass: "border-violet-500/50 bg-violet-500/15 text-violet-300",
  },
  {
    label: "Dolne partie",
    key: "lower_body_load_snapshot",
    fillClass: "bg-orange-500",
    headerClass: "border-orange-500/50 bg-orange-500/15 text-orange-300",
  },
  {
    label: "Górne partie",
    key: "upper_body_load_snapshot",
    fillClass: "bg-orange-400",
    headerClass: "border-orange-400/50 bg-orange-400/15 text-orange-200",
  },
  {
    label: "Core",
    key: "core_load_snapshot",
    fillClass: "bg-[#c4a574]",
    headerClass: "border-[#c4a574]/50 bg-[#c4a574]/15 text-[#e0c9a0]",
  },
];

export const PLAN_RATING_MAX = 5;

/** Shared width so header badges and meters stay aligned. */
export const PLAN_RATING_COLUMNS_CLASS =
  "grid w-full grid-cols-5 gap-2 lg:w-[30rem]";
