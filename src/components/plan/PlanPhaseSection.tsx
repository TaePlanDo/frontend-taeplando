import { ChevronDown, Clock3 } from "lucide-react";
import { useState } from "react";

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
    <Card className="gap-0 overflow-hidden rounded-2xl border-border bg-card/30 py-0 shadow-none">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />

        <div className="min-w-0 shrink-0">
          <h3 className="text-lg font-semibold leading-tight text-foreground">
            {phase.schema.name}
          </h3>
          <p className="mt-0.5 text-sm leading-tight text-muted-foreground">
            {formatExerciseCount(phase.exercises.length)}
          </p>
        </div>

        <CardItemBadge
          icon={<Clock3 className="size-4 text-primary" aria-hidden />}
          className="h-8 border border-border px-3 text-sm font-medium text-foreground"
        >
          {phase.actualMinutes} / {phase.plannedMinutes} min
        </CardItemBadge>
        <DeltaMinutesBadge
          deltaMinutes={phase.deltaMinutes}
          className="h-8 px-3 text-sm"
        />
      </button>

      {open ? (
        <div id={panelId} className="border-t border-border px-4 sm:px-5">
          {phase.exercises.length ? (
            phase.exercises.map((exercise, index) => (
              <PlanExerciseRow
                key={exercise.id}
                exercise={exercise}
                number={phase.exerciseOffset + index + 1}
              />
            ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              Brak ćwiczeń w tej fazie
            </p>
          )}
        </div>
      ) : null}
    </Card>
  );
}
