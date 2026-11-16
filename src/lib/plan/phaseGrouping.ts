import type {
  PlanDetail,
  PlanExercise,
  PlanSchemaSnapshotItem,
} from "@/types/plan";

export type PlanPhase = {
  schema: PlanSchemaSnapshotItem;
  exercises: PlanExercise[];
  plannedMinutes: number;
  actualMinutes: number;
  deltaMinutes: number;
};

export function allocatePhaseMinutes(
  schema: PlanSchemaSnapshotItem[],
  trainingDuration: number,
): Map<number, number> {
  // Percentages are stored to two decimal places; integer arithmetic avoids
  // floating-point differences when equal remainders are ordered.
  const allocations = schema.map((item) => {
    const numerator = Math.round(item.percentage * 100) * trainingDuration;
    return {
      position: item.position,
      minutes: Math.floor(numerator / 10000),
      remainder: numerator % 10000,
    };
  });
  const remaining =
    trainingDuration - allocations.reduce((sum, item) => sum + item.minutes, 0);
  const ranked = [...allocations].sort(
    (a, b) => b.remainder - a.remainder || a.position - b.position,
  );
  for (const item of ranked.slice(0, remaining)) item.minutes += 1;
  return new Map(allocations.map((item) => [item.position, item.minutes]));
}

export function sumExerciseMinutes(exercises: PlanExercise[]): number {
  return exercises.reduce(
    (total, exercise) => total + exercise.duration_minutes_snapshot,
    0,
  );
}

export function groupPlanPhases(plan: PlanDetail): PlanPhase[] {
  const planned = allocatePhaseMinutes(
    plan.schema_snapshot,
    plan.training_duration_snapshot,
  );
  const byPosition = new Map<number, PlanExercise[]>();
  for (const exercise of plan.exercises) {
    const bucket = byPosition.get(exercise.schema_position) ?? [];
    bucket.push(exercise);
    byPosition.set(exercise.schema_position, bucket);
  }

  return [...plan.schema_snapshot]
    .sort((a, b) => a.position - b.position)
    .map((schema) => {
      const exercises = (byPosition.get(schema.position) ?? []).sort(
        (a, b) => a.position - b.position,
      );
      const plannedMinutes = planned.get(schema.position) ?? 0;
      const actualMinutes = sumExerciseMinutes(exercises);
      return {
        schema,
        exercises,
        plannedMinutes,
        actualMinutes,
        deltaMinutes: actualMinutes - plannedMinutes,
      };
    });
}

export function totalActualMinutes(plan: PlanDetail): number {
  return sumExerciseMinutes(plan.exercises);
}
