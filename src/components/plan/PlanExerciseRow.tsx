import { Clock3, Dumbbell, Users } from "lucide-react";
import { useState } from "react";
import { ArrowLeftRight, Trash2 } from "lucide-react";

import { cn } from "cn";
import { RatingMeter } from "@/components/exercise/RatingMeter";
import { ExerciseReadonlyModal } from "@/components/exercise/ExerciseReadonlyModal";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { ExerciseImage } from "@/components/shared/ExerciseImage";
import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import { Button } from "@/components/ui/button";
import { mapPlanExerciseToSnapshot } from "@/lib/mappers/plan";
import type { PlanExercise } from "@/types/plan";
import { PLAN_RATING_COLUMNS, PLAN_RATING_GRID_CLASS } from "./planRatings";

type PlanExerciseRowProps = {
  exercise: PlanExercise;
  number: number;
  onReplace: (exercise: PlanExercise, number: number) => void;
  onRemove: (exercise: PlanExercise) => Promise<void>;
  disabled?: boolean;
  isReplacing?: boolean;
};

export function PlanExerciseRow({
  exercise,
  number,
  onReplace,
  onRemove,
  disabled,
  isReplacing = false,
}: PlanExerciseRowProps) {
  const [open, setOpen] = useState(false);
  const snapshot = mapPlanExerciseToSnapshot(exercise);

  return (
    <>
      <div className="relative border-b border-border">
        <button
          type="button"
          aria-label={`Podgląd ćwiczenia ${exercise.name_snapshot}`}
          onClick={() => setOpen(true)}
          className="flex w-full min-w-0 cursor-pointer flex-col gap-4 rounded-2xl border border-transparent px-3 py-4 text-left transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-7 lg:flex-row lg:items-center lg:gap-6 lg:pr-28"
        >
          <div className="flex w-full min-w-0 flex-1 items-center gap-3 pr-10 sm:gap-4 sm:pr-20 lg:pr-0">
            <div className="relative shrink-0 self-start">
              <ExerciseImage
                src={exercise.image_url_snapshot}
                className="size-16 rounded-xl bg-muted object-cover sm:size-20"
              />
              <span className="absolute -left-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {number}
              </span>
            </div>
            <div className="flex min-h-16 min-w-0 flex-1 flex-col justify-between gap-2 sm:min-h-20">
              <h4 className="break-words text-base font-semibold text-foreground sm:text-xl">
                {exercise.name_snapshot}
              </h4>
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground sm:hidden">
                  <Clock3 className="size-3.5 text-primary" aria-hidden />
                  {exercise.duration_minutes_snapshot} min
                </span>
                <CardItemBadge
                  icon={<Users className="size-3.5" aria-hidden />}
                  className="gap-1 border border-foreground/20 px-2 py-0.5 text-xs text-foreground sm:text-[0.8125rem]"
                  aria-label={`Minimum ${exercise.min_participants_snapshot} uczestników`}
                >
                  {exercise.min_participants_snapshot}+
                </CardItemBadge>
                {exercise.equipment_snapshot.length ? (
                  exercise.equipment_snapshot.map((item) => (
                    <CardItemBadge
                      key={item.id}
                      icon={<Dumbbell className="size-3.5" aria-hidden />}
                      className="gap-1 border border-primary/60 bg-transparent px-2 py-0.5 text-xs text-primary sm:text-[0.8125rem]"
                    >
                      {item.name}
                    </CardItemBadge>
                  ))
                ) : (
                  <CardItemBadge className="border border-foreground/20 bg-transparent px-2 py-0.5 text-xs text-muted-foreground sm:text-[0.8125rem]">
                    Brak sprzętu
                  </CardItemBadge>
                )}
              </div>
            </div>
            <span className="hidden shrink-0 items-center gap-1.5 text-base font-semibold text-foreground sm:inline-flex sm:text-lg">
              <Clock3 className="size-4 text-primary" aria-hidden />
              {exercise.duration_minutes_snapshot} min
            </span>
          </div>
          <div
            className={cn(
              PLAN_RATING_GRID_CLASS,
              "w-full lg:w-[23rem] lg:shrink-0",
            )}
          >
            {PLAN_RATING_COLUMNS.map((column) => (
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
        <div className="absolute top-4 right-3 bottom-[2.375rem] flex flex-col justify-center gap-1 sm:right-7 sm:flex-row sm:items-center lg:top-0 lg:bottom-0">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Wymień ćwiczenie ${exercise.name_snapshot}`}
            className={cn(
              isReplacing &&
                "border-primary text-primary disabled:opacity-100 dark:border-primary",
            )}
            disabled={disabled}
            onClick={() => onReplace(exercise, number)}
          >
            <ArrowLeftRight aria-hidden />
          </Button>
          <CustomizedAlertDialog
            trigger={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Usuń ćwiczenie ${exercise.name_snapshot}`}
                disabled={disabled}
              >
                <Trash2 aria-hidden />
              </Button>
            }
            title="Usuń ćwiczenie z planu"
            message={`Czy na pewno chcesz usunąć „${exercise.name_snapshot}” z planu?`}
            onSubmit={() => onRemove(exercise)}
          />
        </div>
      </div>
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
