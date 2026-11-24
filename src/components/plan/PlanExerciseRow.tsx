import { Clock3, Dumbbell, Users } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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
import {
  PLAN_EXERCISE_LAYOUT_CLASS,
  PLAN_RATING_COLUMNS,
  PLAN_RATING_GRID_CLASS,
} from "./planRatings";

type PlanExerciseRowProps = {
  exercise: PlanExercise;
  number: number;
  onReplace: (exercise: PlanExercise, number: number) => void;
  onRemove: (exercise: PlanExercise) => Promise<void>;
  disabled?: boolean;
  isReplacing?: boolean;
  canReorder?: boolean;
};

export function PlanExerciseRow({
  exercise,
  number,
  onReplace,
  onRemove,
  disabled,
  isReplacing = false,
  canReorder = false,
}: PlanExerciseRowProps) {
  const [open, setOpen] = useState(false);
  const snapshot = mapPlanExerciseToSnapshot(exercise);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id, disabled: disabled || !canReorder });

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn(
          "relative border-b border-border lg:items-center lg:px-7",
          PLAN_EXERCISE_LAYOUT_CLASS,
          isDragging && "z-30 bg-background shadow-lg",
        )}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Przenieś ćwiczenie ${exercise.name_snapshot}`}
          disabled={disabled || !canReorder}
          className="absolute top-4 left-0 z-10 flex h-16 w-8 touch-none cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 lg:top-1/2 lg:h-10 lg:w-7 lg:-translate-y-1/2"
        >
          <GripVertical className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Podgląd ćwiczenia ${exercise.name_snapshot}`}
          onClick={() => setOpen(true)}
          className="flex w-full min-w-0 cursor-pointer flex-col gap-4 px-3 py-4 text-left before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-transparent before:transition-colors hover:before:border-primary focus-visible:outline-none focus-visible:before:border-primary focus-visible:before:ring-2 focus-visible:before:ring-ring lg:col-span-2 lg:grid lg:grid-cols-subgrid lg:items-center lg:gap-x-8 lg:px-0"
        >
          <div className="grid w-full min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-2 pr-10 pl-6 lg:grid-cols-[5rem_minmax(0,1fr)_auto] lg:gap-x-6 lg:pr-0 lg:pl-0">
            <div className="relative self-start lg:row-span-2">
              <ExerciseImage
                src={exercise.image_url_snapshot}
                className="size-16 rounded-xl bg-muted object-cover lg:size-20"
              />
              <span className="absolute -left-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {number}
              </span>
            </div>
            <h4 className="min-w-0 self-start break-words text-base font-semibold text-foreground lg:text-xl">
              {exercise.name_snapshot}
            </h4>
            <div className="col-span-2 flex min-w-0 flex-wrap items-center gap-1 lg:col-span-1 lg:col-start-2 lg:row-start-2 lg:self-end lg:gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground lg:hidden">
                <Clock3 className="size-3.5 text-primary" aria-hidden />
                {exercise.duration_minutes_snapshot} min
              </span>
              <CardItemBadge
                icon={<Users className="size-3.5" aria-hidden />}
                className="gap-1 border border-foreground/20 px-2 py-0.5 text-xs text-foreground lg:text-[0.8125rem]"
                aria-label={`Minimum ${exercise.min_participants_snapshot} uczestników`}
              >
                {exercise.min_participants_snapshot}+
              </CardItemBadge>
              {exercise.equipment_snapshot.length ? (
                exercise.equipment_snapshot.map((item) => (
                  <CardItemBadge
                    key={item.id}
                    icon={<Dumbbell className="size-3.5" aria-hidden />}
                    className="gap-1 border border-primary/60 bg-transparent px-2 py-0.5 text-xs text-primary lg:text-[0.8125rem]"
                  >
                    {item.name}
                  </CardItemBadge>
                ))
              ) : (
                <CardItemBadge className="border border-foreground/20 bg-transparent px-2 py-0.5 text-xs text-muted-foreground lg:text-[0.8125rem]">
                  Brak sprzętu
                </CardItemBadge>
              )}
            </div>
            <span className="hidden shrink-0 items-center gap-1.5 text-base font-semibold text-foreground lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:inline-flex lg:self-center lg:text-lg">
              <Clock3 className="size-4 text-primary" aria-hidden />
              {exercise.duration_minutes_snapshot} min
            </span>
          </div>
          <div className={cn(PLAN_RATING_GRID_CLASS, "w-full")}>
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
        <div className="absolute top-4 right-3 bottom-[2.375rem] flex flex-col justify-center gap-2 lg:static lg:col-start-3 lg:items-center">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Wymień ćwiczenie ${exercise.name_snapshot}`}
            className={cn(
              "cursor-pointer",
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
                className="cursor-pointer"
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
