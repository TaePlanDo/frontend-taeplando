import type { CatalogReference, TrainingSegment } from "@/types/exercise";

export type PlanSchemaSnapshotItem = {
  position: number;
  segment_id: number;
  code: string;
  name: string;
  percentage: number;
};

export type PlanExercise = {
  id: string;
  trainer_exercise_id: string;
  exercise_id: string;
  exercise_version_id: string | null;
  position: number;
  schema_position: number;
  name_snapshot: string;
  description_snapshot: string;
  image_url_snapshot: string | null;
  min_age_snapshot: number;
  max_age_snapshot: number;
  min_participants_snapshot: number;
  max_participants_snapshot: number;
  duration_minutes_snapshot: number;
  physical_difficulty_snapshot: number;
  technical_difficulty_snapshot: number;
  upper_body_load_snapshot: number;
  lower_body_load_snapshot: number;
  core_load_snapshot: number;
  equipment_snapshot: CatalogReference[];
  training_types_snapshot: CatalogReference[];
  segments_snapshot: TrainingSegment[];
};

export type PlanListItem = {
  id: string;
  training_group_id: string;
  name: string;
  participant_count: number;
  group_name_snapshot: string;
  group_min_age_snapshot: number;
  group_max_age_snapshot: number;
  training_duration_snapshot: number;
  available_equipment_snapshot: CatalogReference[];
  training_types_snapshot: CatalogReference[];
  schema_snapshot: PlanSchemaSnapshotItem[];
  generated_at: string;
};

export type PlanDetail = PlanListItem & {
  exercises: PlanExercise[];
};

export type PlanGenerationJobStatus =
  "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "TIMED_OUT";

export type PlanGenerationParameters = {
  training_group_id: string;
  participant_count: number;
  available_equipment_ids: string[];
  training_type_id: string | null;
};

export type PlanGenerationAccepted = {
  id: string;
  status: PlanGenerationJobStatus;
};

export type PlanGenerationStatus = PlanGenerationAccepted & {
  plan_id: string | null;
  error_code: string | null;
  error_message: string | null;
};
