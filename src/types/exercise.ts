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
};

export type ExerciseScope = "PRIVATE" | "GLOBAL";

export type TrainerExerciseStatus = "ACTIVE" | "INACTIVE" | "HIDDEN";
