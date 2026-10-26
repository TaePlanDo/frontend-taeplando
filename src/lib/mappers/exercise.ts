import type {
  ExerciseFormOutput,
  ExerciseFormValues,
} from "@/lib/validation/exercise";
import type { Exercise, ExerciseWrite } from "@/types/exercise";

export function toExerciseFormValues(
  exercise?: Exercise | null,
): ExerciseFormValues {
  if (!exercise) {
    return {
      name: "",
      description: "",
      minAge: "",
      maxAge: "",
      minParticipants: "",
      maxParticipants: "",
      durationMinutes: "0",
      equipmentIds: [],
      trainingTypeIds: [],
      segmentIds: [],
    };
  }

  return {
    name: exercise.name,
    description: exercise.description,
    minAge: String(exercise.min_age),
    maxAge: String(exercise.max_age),
    minParticipants: String(exercise.min_participants),
    maxParticipants: String(exercise.max_participants),
    durationMinutes: String(exercise.duration_minutes),
    equipmentIds: exercise.equipment.map(({ id }) => id),
    trainingTypeIds: exercise.training_types.map(({ id }) => id),
    segmentIds: exercise.segments.map(({ id }) => String(id)),
  };
}

export function toExerciseWrite(values: ExerciseFormOutput): ExerciseWrite {
  return {
    name: values.name,
    description: values.description,
    image_url: null,
    min_age: values.minAge,
    max_age: values.maxAge,
    min_participants: values.minParticipants,
    max_participants: values.maxParticipants,
    duration_minutes: values.durationMinutes,
    equipment_ids: values.equipmentIds,
    training_type_ids: values.trainingTypeIds,
    segment_ids: values.segmentIds,
  };
}
