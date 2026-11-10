import { Clock3, Dumbbell } from "lucide-react";
import { useState } from "react";

import { ExerciseReadonlyModal } from "@/components/exercise/ExerciseReadonlyModal";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { ExerciseImage } from "@/components/shared/ExerciseImage";
import type { PlanExercise } from "@/types/plan";

type PlanExerciseRowProps = {
  exercise: PlanExercise;
  number: number;
};

export function PlanExerciseRow({ exercise, number }: PlanExerciseRowProps) {
  const [open, setOpen] = useState(false);
  const snapshot = {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent border-b-border px-2 py-4 text-left transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-4"
      >
        <div className="relative shrink-0">
          <ExerciseImage
            src={exercise.image_url_snapshot}
            className="size-16 rounded-xl bg-muted object-cover sm:size-20"
          />
          <span className="absolute -left-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-foreground">
            {number}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h4 className="break-words text-lg font-semibold text-foreground sm:text-xl">
            {exercise.name_snapshot}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {exercise.equipment_snapshot.length ? (
              exercise.equipment_snapshot.map((item) => (
                <CardItemBadge
                  key={item.id}
                  icon={<Dumbbell className="size-4" aria-hidden />}
                  className="border border-primary/60 bg-transparent px-3 py-1 text-sm text-primary"
                >
                  {item.name}
                </CardItemBadge>
              ))
            ) : (
              <CardItemBadge className="border border-foreground/20 bg-transparent px-3 py-1 text-sm text-muted-foreground">
                Brak sprzętu
              </CardItemBadge>
            )}
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start text-base font-semibold text-foreground sm:text-lg">
          <Clock3 className="size-4 text-primary" aria-hidden />
          {exercise.duration_minutes_snapshot} min
        </span>
      </button>
      <CustomizedDialog
        open={open}
        onOpenChange={setOpen}
        title="Podgląd ćwiczenia"
        className="grid-rows-[auto_minmax(0,1fr)] max-h-[calc(100dvh-2rem)] gap-5 overflow-hidden p-4 sm:!top-8 sm:!bottom-8 sm:!h-auto sm:!translate-y-0 sm:max-w-190 sm:p-6"
      >
        <ExerciseReadonlyModal
          exercise={snapshot}
          onClose={() => setOpen(false)}
        />
      </CustomizedDialog>
    </>
  );
}
