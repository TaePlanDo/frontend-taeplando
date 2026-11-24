import { arrayMove } from "@dnd-kit/sortable";

import type { PlanDetail } from "@/types/plan";

export function reorderPlanExercises(
  plan: PlanDetail,
  activeId: string,
  overId: string,
): PlanDetail | null {
  const ordered = [...plan.exercises].sort((a, b) => a.position - b.position);
  const active = ordered.find((exercise) => exercise.id === activeId);
  const over = ordered.find((exercise) => exercise.id === overId);
  if (
    !active ||
    !over ||
    active.id === over.id ||
    active.schema_position !== over.schema_position
  )
    return null;
  const phase = ordered.filter(
    (exercise) => exercise.schema_position === active.schema_position,
  );
  const reordered = arrayMove(
    phase,
    phase.indexOf(active),
    phase.indexOf(over),
  );
  let index = 0;
  return {
    ...plan,
    exercises: ordered.map((exercise) =>
      exercise.schema_position === active.schema_position
        ? { ...reordered[index++], position: exercise.position }
        : exercise,
    ),
  };
}
