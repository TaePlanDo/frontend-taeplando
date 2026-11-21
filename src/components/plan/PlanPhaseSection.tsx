import { ChevronDown, Clock3 } from "lucide-react";
import { useState } from "react";

import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { Card } from "@/components/ui/card";
import { cn } from "cn";
import { formatExerciseCount } from "@/lib/format/plural";
import { type PlanPhase } from "@/lib/plan/phaseGrouping";

import { DeltaMinutesBadge } from "./DeltaMinutesBadge";
import { PlanExerciseRow } from "./PlanExerciseRow";
import { PLAN_RATING_COLUMNS, PLAN_RATING_GRID_CLASS } from "./planRatings";

type PlanPhaseSectionProps = {
  phase: PlanPhase;
  defaultOpen?: boolean;
};

export function PlanPhaseSection({
  phase,
  defaultOpen = true,
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
          className="grid w-full grid-cols-[minmax(0,1fr)_5.5rem_2.75rem] items-center gap-2 px-3 py-4 text-left sm:grid-cols-[minmax(0,1fr)_7rem_3.5rem] sm:gap-4 sm:px-7"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-4">
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />

            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-tight text-foreground [overflow-wrap:anywhere] sm:text-lg">
                {phase.schema.name}
              </h3>
              <p className="mt-0.5 text-xs leading-tight text-muted-foreground sm:text-sm">
                {formatExerciseCount(phase.exercises.length)}
              </p>
            </div>
          </div>

          <CardItemBadge
            icon={<Clock3 className="size-4 text-primary" aria-hidden />}
            className="h-7 justify-center gap-1 border border-border px-1 text-xs font-medium whitespace-nowrap text-foreground sm:h-8 sm:px-2 sm:text-sm"
            aria-label={`Czas fazy: ${phase.actualMinutes} z ${phase.plannedMinutes} minut`}
          >
            {phase.actualMinutes} / {phase.plannedMinutes}
          </CardItemBadge>
          <span className="flex justify-end">
            <DeltaMinutesBadge
              deltaMinutes={phase.deltaMinutes}
              className="h-7 px-1 text-xs sm:h-8 sm:px-2 sm:text-sm"
            />
          </span>
        </button>
        {open && phase.exercises.length > 0 ? (
          <div className="border-t border-border px-3 py-2 sm:px-7">
            <div
              className={cn(
                PLAN_RATING_GRID_CLASS,
                "w-full lg:ml-auto lg:w-[24rem]",
              )}
            >
              {PLAN_RATING_COLUMNS.map((column) => (
                <span
                  key={column.key}
                  className={cn(
                    "min-w-0 text-center text-[0.625rem] font-medium leading-tight sm:text-[0.6875rem]",
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
              />
            ))
          ) : (
            <p className="px-4 py-4 text-sm text-muted-foreground sm:px-5">
              Brak ćwiczeń w tej fazie
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
