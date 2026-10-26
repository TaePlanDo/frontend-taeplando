export type Exercise = {
  id: string;
  owner_user_id: string;
  scope: ExerciseScope;
  image_url: string | null;
  name: string;
  description: string;
  min_age: number;
  max_age: number;
  min_participants: number;
  max_participants: number;
  duration_minutes: number;
  status: TrainerExerciseStatus;
  equipment: CatalogReference[];
  training_types: CatalogReference[];
  segments: TrainingSegment[];
};

export type CatalogReference = { id: string; name: string };
export type TrainingSegment = { id: number; code: string; name: string };

export type ExerciseWrite = {
  name: string;
  description: string;
  image_url: string | null;
  min_age: number;
  max_age: number;
  min_participants: number;
  max_participants: number;
  duration_minutes: number;
  equipment_ids: string[];
  training_type_ids: string[];
  segment_ids: number[];
};

export type ExerciseScope = "PRIVATE" | "GLOBAL";

export type TrainerExerciseStatus = "ACTIVE" | "INACTIVE" | "HIDDEN";
