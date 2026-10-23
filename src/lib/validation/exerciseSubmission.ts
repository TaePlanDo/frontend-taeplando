import { toExerciseWrite } from "@/lib/mappers/exercise";
import { exerciseFormSchema } from "@/lib/validation/exercise";
import type { ExerciseWrite } from "@/types/exercise";

export type ExerciseFieldErrors = Partial<
  Record<
    | "name"
    | "description"
    | "age"
    | "participants"
    | "duration"
    | "type"
    | "segment",
    string
  >
>;

export function validateExerciseSubmission(
  data: FormData,
  equipmentIds: string[],
  trainingTypeIds: string[],
  segmentIds: number[],
): { payload?: ExerciseWrite; errors: ExerciseFieldErrors } {
  const result = exerciseFormSchema.safeParse({
    name: String(data.get("name") ?? ""),
    description: String(data.get("description") ?? ""),
    minAge: String(data.get("min_age") ?? ""),
    maxAge: String(data.get("max_age") ?? ""),
    minParticipants: String(data.get("min_participants") ?? ""),
    maxParticipants: String(data.get("max_participants") ?? ""),
    durationMinutes: String(data.get("duration_minutes") ?? ""),
    equipmentIds,
    trainingTypeIds,
    segmentIds: segmentIds.map(String),
  });
  if (result.success)
    return { payload: toExerciseWrite(result.data), errors: {} };
  const errors: ExerciseFieldErrors = {};
  const fields: Record<string, keyof ExerciseFieldErrors> = {
    minAge: "age",
    maxAge: "age",
    minParticipants: "participants",
    maxParticipants: "participants",
    durationMinutes: "duration",
    trainingTypeIds: "type",
    segmentIds: "segment",
    name: "name",
    description: "description",
  };
  for (const issue of result.error.issues) {
    const field = fields[String(issue.path[0])];
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { errors };
}
