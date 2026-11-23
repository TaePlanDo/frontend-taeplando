import { ChevronDown, Clock3 } from "lucide-react";
import { useState } from "react";

import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { Card } from "@/components/ui/card";
import { cn } from "cn";
import { formatExerciseCount } from "@/lib/format/plural";
import { type PlanPhase } from "@/lib/plan/phaseGrouping";
import type { PlanExercise } from "@/types/plan";

import { DeltaMinutesBadge } from "./DeltaMinutesBadge";
import { PlanExerciseRow } from "./PlanExerciseRow";
import { PLAN_RATING_COLUMNS, PLAN_RATING_GRID_CLASS } from "./planRatings";

type PlanPhaseSectionProps = {
  phase: PlanPhase;
  defaultOpen?: boolean;
  onReplace: (exercise: PlanExercise, number: number) => void;
  onRemove: (exercise: PlanExercise) => Promise<void>;
  disabled?: boolean;
  replacingExerciseId?: string;
};

export function PlanPhaseSection({
  phase,
  defaultOpen = true,
  onReplace,
  onRemove,
  disabled,
  replacingExerciseId,
}: PlanPhaseSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `phase-${phase.schema.position}`;

  return (
    <Card className="gap-0 rounded-2xl border-border bg-card/30 py-0 shadow-none">
      <div
        className={cn(
          "sticky top-16 z-20 bg-background",
          open ? "rounded-t-2xl" : "rounded-2xl",
        )}
      >
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-3 py-4 text-left lg:gap-4 lg:px-7"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:gap-3">
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />

            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-tight text-foreground [overflow-wrap:break-word] lg:text-lg">
                {phase.schema.name}
              </h3>
              <p className="mt-0.5 text-xs leading-tight text-muted-foreground lg:text-sm">
                {formatExerciseCount(phase.exercises.length)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <DeltaMinutesBadge
              deltaMinutes={phase.deltaMinutes}
              className="h-7 px-1 text-xs lg:h-8 lg:px-2 lg:text-sm"
            />
            <CardItemBadge
              icon={<Clock3 className="size-4 text-primary" aria-hidden />}
              className="h-7 justify-center gap-1 border border-border px-1 text-xs font-medium whitespace-nowrap text-foreground lg:h-8 lg:px-2 lg:text-sm"
              aria-label={`Czas fazy: ${phase.actualMinutes} z ${phase.plannedMinutes} minut`}
            >
              {phase.actualMinutes} / {phase.plannedMinutes}
            </CardItemBadge>
          </div>
        </button>
        {open && phase.exercises.length > 0 ? (
          <div className="border-t border-border px-3 py-2 lg:px-7">
            <div
              className={cn(
                PLAN_RATING_GRID_CLASS,
                "w-full items-center lg:ml-auto lg:mr-[5.25rem] lg:w-[23rem]",
              )}
            >
              {PLAN_RATING_COLUMNS.map((column) => (
                <span
                  key={column.key}
                  className={cn(
                    "min-w-0 text-center text-[0.625rem] font-medium leading-tight lg:text-[0.6875rem]",
                    column.headerClass,
                  )}
                >
                  {column.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {open ? (
        <div id={panelId} className="border-t border-border">
          {phase.exercises.length ? (
            phase.exercises.map((exercise, index) => (
              <PlanExerciseRow
                key={exercise.id}
                exercise={exercise}
                number={index + 1}
                onReplace={onReplace}
                onRemove={onRemove}
                disabled={disabled}
                isReplacing={exercise.id === replacingExerciseId}
              />
            ))
          ) : (
            <p className="px-4 py-4 text-sm text-muted-foreground lg:px-5">
              Brak ćwiczeń w tej fazie
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
