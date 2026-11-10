import { ChevronDown, Clock3 } from "lucide-react";
import { useState } from "react";

import { EXERCISE_RATING_COLUMNS } from "@/components/exercise/exerciseRatings";
import { Badge } from "@/components/ui/badge";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { Card } from "@/components/ui/card";
import { cn } from "cn";
import { formatExerciseCount } from "@/lib/format/plural";
import { type PlanPhase } from "@/lib/plan/phaseGrouping";

import { DeltaMinutesBadge } from "./DeltaMinutesBadge";
import { PlanExerciseRow } from "./PlanExerciseRow";

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
      <button
        type="button"
        className={cn(
          "sticky top-16 z-20 flex w-full flex-wrap items-center gap-3 bg-background px-4 py-4 text-left sm:gap-4 sm:px-7 lg:flex-nowrap",
          open ? "rounded-t-2xl" : "rounded-2xl",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-4">
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />

          <div className="min-w-0 flex-1 lg:flex-none">
            <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
              {phase.schema.name}
            </h3>
            <p className="mt-0.5 text-xs leading-tight text-muted-foreground sm:text-sm">
              {formatExerciseCount(phase.exercises.length)}
            </p>
          </div>

          <CardItemBadge
            icon={<Clock3 className="size-4 text-primary" aria-hidden />}
            className="h-7 gap-1 border border-border px-2 text-xs font-medium text-foreground sm:h-8 sm:px-3 sm:text-sm"
          >
            {phase.actualMinutes} / {phase.plannedMinutes} min
          </CardItemBadge>
          <DeltaMinutesBadge
            deltaMinutes={phase.deltaMinutes}
            className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
          />
        </div>
        {open && phase.exercises.length > 0 ? (
          <div className="grid w-full grid-cols-5 gap-1.5 lg:w-[24rem] lg:shrink-0">
            {EXERCISE_RATING_COLUMNS.map((column) => (
              <Badge
                key={column.key}
                variant="outline"
                className={cn(
                  "h-auto min-h-8 w-full min-w-0 whitespace-normal rounded-md px-0.5 py-1 text-center text-[0.6875rem] leading-tight tracking-tight [overflow-wrap:anywhere]",
                  column.headerClass,
                )}
              >
                <span className="sm:hidden" aria-hidden>
                  {column.shortLabel}
                </span>
                <span className="hidden sm:inline">{column.label}</span>
                <span className="sr-only sm:hidden">{column.label}</span>
              </Badge>
            ))}
          </div>
        ) : null}
      </button>

      {open ? (
        <div id={panelId} className="border-t border-border">
          {phase.exercises.length ? (
            phase.exercises.map((exercise, index) => (
              <PlanExerciseRow
                key={exercise.id}
                exercise={exercise}
                number={phase.exerciseOffset + index + 1}
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
