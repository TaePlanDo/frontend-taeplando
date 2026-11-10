import { CalendarDays, Clock3, Sparkles, Users } from "lucide-react";

import { GroupSessionStatCard } from "@/components/plan/GroupSessionStatCard";
import { PlanCardItem } from "@/components/plan/PlanCardItem";
import { ReadonlySchemaBar } from "@/components/plan/ReadonlySchemaBar";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatParticipantCount } from "@/lib/format/plural";
import { toPlanSchemaSnapshot } from "@/lib/mappers/group";
import type { Group } from "@/types/group";
import type { PlanListItem } from "@/types/plan";

type GroupPlanChoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
  participantCount: number;
  plans: PlanListItem[];
  onOpenPlan: (planId: string) => void;
  onGenerateNew: () => void;
  isGenerating?: boolean;
};

export function GroupPlanChoiceDialog({
  open,
  onOpenChange,
  group,
  participantCount,
  plans,
  onOpenPlan,
  onGenerateNew,
  isGenerating = false,
}: GroupPlanChoiceDialogProps) {
  return (
    <CustomizedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={group.name}
      className="flex max-h-[90vh] flex-col gap-6 overflow-y-auto sm:max-w-3xl"
    >
      <div className="flex flex-col gap-6">
        <Card className="gap-5 rounded-2xl border-border bg-card/40 p-4 shadow-none sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <GroupSessionStatCard
              icon={<CalendarDays className="size-4" aria-hidden />}
              label="Wiek"
              value={`${group.min_age}–${group.max_age} lat`}
            />
            <GroupSessionStatCard
              icon={<Users className="size-4" aria-hidden />}
              label="Uczestnicy"
              value={formatParticipantCount(participantCount)}
            />
            <GroupSessionStatCard
              icon={<Clock3 className="size-4" aria-hidden />}
              label="Czas sesji"
              value={`${group.duration_minutes} min`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <CardTitle className="text-base text-foreground">
              Schemat grupy
            </CardTitle>
            <CardContent className="px-0">
              <ReadonlySchemaBar schema={toPlanSchemaSnapshot(group.schema)} />
            </CardContent>
          </div>
        </Card>

        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-foreground">
            Wybierz z ostatnich planów
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => (
              <PlanCardItem
                key={plan.id}
                variant="choice"
                plan={plan}
                onOpen={() => onOpenPlan(plan.id)}
              />
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>lub</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <CustomizedButton
          type="button"
          variant="primary"
          className="gap-2"
          disabled={isGenerating}
          onClick={onGenerateNew}
        >
          <Sparkles className="size-4" aria-hidden />
          {isGenerating ? "Rozpoczynanie…" : "Generuj nowy plan"}
        </CustomizedButton>
      </div>
    </CustomizedDialog>
  );
}
