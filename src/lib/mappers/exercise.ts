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
      minAge: "1",
      maxAge: "99",
      minParticipants: "1",
      maxParticipants: "99",
      durationMinutes: "0",
      physicalDifficulty: "3",
      technicalDifficulty: "3",
      upperBodyLoad: "3",
      lowerBodyLoad: "3",
      coreLoad: "3",
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
    physicalDifficulty: String(exercise.physical_difficulty),
    technicalDifficulty: String(exercise.technical_difficulty),
    upperBodyLoad: String(exercise.upper_body_load),
    lowerBodyLoad: String(exercise.lower_body_load),
    coreLoad: String(exercise.core_load),
    equipmentIds: exercise.equipment.map(({ id }) => id),
    trainingTypeIds: exercise.training_types.map(({ id }) => id),
    segmentIds: exercise.segments.map(({ id }) => String(id)),
  };
}

export function toExerciseWrite(
  values: ExerciseFormOutput,
  imageUrl: string | null = null,
): ExerciseWrite {
  return {
    name: values.name,
    description: values.description,
    image_url: imageUrl,
    min_age: values.minAge,
    max_age: values.maxAge,
    min_participants: values.minParticipants,
    max_participants: values.maxParticipants,
    duration_minutes: values.durationMinutes,
    physical_difficulty: values.physicalDifficulty,
    technical_difficulty: values.technicalDifficulty,
    upper_body_load: values.upperBodyLoad,
    lower_body_load: values.lowerBodyLoad,
    core_load: values.coreLoad,
    equipment_ids: values.equipmentIds,
    training_type_ids: values.trainingTypeIds,
    segment_ids: values.segmentIds,
  };
}
