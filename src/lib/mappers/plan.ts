import type { ExerciseDetails } from "@/types/exercise";
import type { PlanExercise } from "@/types/plan";

export function mapPlanExerciseToSnapshot(
  exercise: PlanExercise,
): ExerciseDetails {
  return {
    name: exercise.name_snapshot,
    description: exercise.description_snapshot,
    image_url: exercise.image_url_snapshot,
    min_age: exercise.min_age_snapshot,
    max_age: exercise.max_age_snapshot,
    min_participants: exercise.min_participants_snapshot,
    max_participants: exercise.max_participants_snapshot,
    duration_minutes: exercise.duration_minutes_snapshot,
    physical_difficulty: exercise.physical_difficulty_snapshot,
    technical_difficulty: exercise.technical_difficulty_snapshot,
    upper_body_load: exercise.upper_body_load_snapshot,
    lower_body_load: exercise.lower_body_load_snapshot,
    core_load: exercise.core_load_snapshot,
    equipment: exercise.equipment_snapshot,
    training_types: exercise.training_types_snapshot,
    segments: exercise.segments_snapshot,
  };
}
