import { Clock3, Dumbbell, Users } from "lucide-react";
import { useState } from "react";

import { EXERCISE_RATING_COLUMNS } from "@/components/exercise/exerciseRatings";
import { RatingMeter } from "@/components/exercise/RatingMeter";
import { ExerciseReadonlyModal } from "@/components/exercise/ExerciseReadonlyModal";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { ExerciseImage } from "@/components/shared/ExerciseImage";
import { mapPlanExerciseToSnapshot } from "@/lib/mappers/plan";
import type { PlanExercise } from "@/types/plan";

type PlanExerciseRowProps = {
  exercise: PlanExercise;
  number: number;
};

export function PlanExerciseRow({ exercise, number }: PlanExerciseRowProps) {
  const [open, setOpen] = useState(false);
  const snapshot = mapPlanExerciseToSnapshot(exercise);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer flex-col gap-4 rounded-2xl border border-transparent border-b-border px-4 py-4 text-left transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-7 lg:flex-row lg:items-center lg:gap-6"
      >
        <div className="flex w-full min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-baseline gap-3 sm:gap-4">
            <div className="relative shrink-0 self-start">
              <ExerciseImage
                src={exercise.image_url_snapshot}
                className="size-16 rounded-xl bg-muted object-cover sm:size-20"
              />
              <span className="absolute -left-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-foreground">
                {number}
              </span>
            </div>
            <h4 className="min-w-0 flex-1 break-words text-lg font-semibold text-foreground sm:text-xl">
              {exercise.name_snapshot}
            </h4>
            <span className="hidden shrink-0 items-baseline gap-1.5 text-base font-semibold text-foreground sm:inline-flex sm:text-lg">
              <Clock3 className="size-4 self-center text-primary" aria-hidden />
              {exercise.duration_minutes_snapshot} min
            </span>
          </div>
          <div className="flex w-full flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 pr-1 text-sm font-semibold text-foreground sm:hidden">
              <Clock3 className="size-4 text-primary" aria-hidden />
              {exercise.duration_minutes_snapshot} min
            </span>
            <CardItemBadge
              icon={<Users className="size-4" aria-hidden />}
              className="border border-foreground/20 px-3 py-1 text-sm text-foreground"
              aria-label={`Minimum ${exercise.min_participants_snapshot} uczestników`}
            >
              {exercise.min_participants_snapshot}+
            </CardItemBadge>
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
        <div className="grid w-full grid-cols-5 gap-1.5 lg:w-[24rem] lg:shrink-0">
          {EXERCISE_RATING_COLUMNS.map((column) => (
            <RatingMeter
              key={column.key}
              label={column.label}
              value={snapshot[column.key]}
              fillClass={column.fillClass}
              showLabel={false}
            />
          ))}
        </div>
      </button>
      <CustomizedDialog
        open={open}
        onOpenChange={setOpen}
        title="Podgląd ćwiczenia"
        className="grid-rows-[auto_minmax(0,1fr)] max-h-[calc(100dvh-2rem)] gap-5 overflow-hidden p-4 sm:!top-8 sm:!bottom-8 sm:!h-auto sm:!translate-y-0 sm:max-w-190 sm:p-6"
      >
        <ExerciseReadonlyModal
          kind="snapshot"
          exercise={snapshot}
          onClose={() => setOpen(false)}
        />
      </CustomizedDialog>
    </>
  );
}
