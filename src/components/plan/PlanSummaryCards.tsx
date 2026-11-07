import { CalendarDays, Clock3 } from "lucide-react";

import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { PlanDetail } from "@/types/plan";
import { totalActualMinutes } from "@/lib/plan/phaseGrouping";

import { DeltaMinutesBadge } from "./DeltaMinutesBadge";
import { ReadonlySchemaBar } from "./ReadonlySchemaBar";

type PlanSummaryCardsProps = {
  plan: PlanDetail;
};

export function PlanSummaryCards({ plan }: PlanSummaryCardsProps) {
  const actual = totalActualMinutes(plan);
  const planned = plan.training_duration_snapshot;
  const delta = actual - planned;

  return (
    <div className="grid gap-4 lg:grid-cols-[max-content_minmax(0,1fr)]">
      <Card className="gap-4 rounded-2xl border-border bg-card/40 p-4 shadow-none sm:p-5">
        <CardTitle className="text-base text-foreground">
          {plan.group_name_snapshot}
        </CardTitle>
        <CardContent className="flex flex-wrap gap-3 px-0">
          <CardItemBadge
            icon={<CalendarDays className="size-4 text-primary" aria-hidden />}
            className="rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm font-medium text-foreground"
          >
            {plan.group_min_age_snapshot}–{plan.group_max_age_snapshot} lat
          </CardItemBadge>
          <CardItemBadge
            icon={<Clock3 className="size-4 text-primary" aria-hidden />}
            className="rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm font-medium text-foreground"
          >
            {planned} min
          </CardItemBadge>
        </CardContent>
      </Card>

      <Card className="min-w-0 gap-4 rounded-2xl border-border bg-card/40 p-4 shadow-none sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base text-foreground">
            Schematy grupy
          </CardTitle>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:gap-3">
            <p className="inline-flex items-center gap-2 text-sm text-foreground">
              <Clock3 className="size-4 shrink-0 text-primary" aria-hidden />
              Czas trwania: {actual} / {planned} min
            </p>
            <DeltaMinutesBadge
              deltaMinutes={delta}
              className="h-7 px-2.5 text-xs"
            />
          </div>
        </div>
        <CardContent className="px-0">
          <ReadonlySchemaBar schema={plan.schema_snapshot} />
        </CardContent>
      </Card>
    </div>
  );
}
