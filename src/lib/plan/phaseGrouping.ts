import type {
  PlanDetail,
  PlanExercise,
  PlanSchemaSnapshotItem,
} from "@/types/plan";

export type PlanPhase = {
  schema: PlanSchemaSnapshotItem;
  exercises: PlanExercise[];
  exerciseOffset: number;
  plannedMinutes: number;
  actualMinutes: number;
  deltaMinutes: number;
};

export function plannedPhaseMinutes(
  percentage: number,
  trainingDuration: number,
): number {
  return Math.round((percentage / 100) * trainingDuration);
}

export function sumExerciseMinutes(exercises: PlanExercise[]): number {
  return exercises.reduce(
    (total, exercise) => total + exercise.duration_minutes_snapshot,
    0,
  );
}

export function groupPlanPhases(plan: PlanDetail): PlanPhase[] {
  const byPosition = new Map<number, PlanExercise[]>();
  for (const exercise of plan.exercises) {
    const bucket = byPosition.get(exercise.schema_position) ?? [];
    bucket.push(exercise);
    byPosition.set(exercise.schema_position, bucket);
  }

  let exerciseOffset = 0;
  return [...plan.schema_snapshot]
    .sort((a, b) => a.position - b.position)
    .map((schema) => {
      const exercises = (byPosition.get(schema.position) ?? []).sort(
        (a, b) => a.position - b.position,
      );
      const plannedMinutes = plannedPhaseMinutes(
        schema.percentage,
        plan.training_duration_snapshot,
      );
      const actualMinutes = sumExerciseMinutes(exercises);
      const phase: PlanPhase = {
        schema,
        exercises,
        exerciseOffset,
        plannedMinutes,
        actualMinutes,
        deltaMinutes: actualMinutes - plannedMinutes,
      };
      exerciseOffset += exercises.length;
      return phase;
    });
}

export function totalActualMinutes(plan: PlanDetail): number {
  return sumExerciseMinutes(plan.exercises);
}
