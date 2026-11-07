import {
  ArrowLeft,
  CalendarDays,
  ListOrdered,
  Tag,
  Trash2,
  Users,
} from "lucide-react";

import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { Button } from "@/components/ui/button";
import { formatMediumDate } from "@/lib/format/date-to-text";
import { formatExerciseCount } from "@/lib/format/plural";
import type { PlanDetail } from "@/types/plan";

type PlanDetailHeaderProps = {
  plan: PlanDetail;
  onBack: () => void;
  onRegenerate: () => void;
  onDelete: () => void | Promise<void>;
};

export function PlanDetailHeader({
  plan,
  onBack,
  onRegenerate,
  onDelete,
}: PlanDetailHeaderProps) {
  const primaryType = plan.training_types_snapshot[0]?.name;

  return (
    <header className="flex flex-col gap-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-auto w-fit gap-2 px-0 text-sm font-medium text-foreground hover:bg-transparent hover:opacity-80"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Wróć do listy
      </Button>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="min-w-0 text-2xl font-bold text-primary">
            {plan.name}
          </h1>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <CustomizedButton
              variant="outline"
              className="w-auto px-4 text-sm"
              onClick={onRegenerate}
            >
              Wygeneruj ponownie
            </CustomizedButton>
            <CustomizedAlertDialog
              trigger={
                <CustomizedButton
                  variant="danger"
                  className="w-auto gap-2 px-4 text-sm"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Usuń
                </CustomizedButton>
              }
              title="Usuwanie planu"
              message={`Czy na pewno chcesz usunąć „${plan.name}”? Tej operacji nie da się cofnąć.`}
              onSubmit={onDelete}
            />
          </div>
        </div>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground">
          <li className="inline-flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            Wygenerowano {formatMediumDate(plan.generated_at)}
          </li>
          <li className="inline-flex items-center gap-2">
            <Users className="size-4 text-primary" aria-hidden />
            {plan.participant_count} osób
          </li>
          {primaryType ? (
            <li className="inline-flex items-center gap-2">
              <Tag className="size-4 text-primary" aria-hidden />
              Typ: {primaryType}
            </li>
          ) : null}
          <li className="inline-flex items-center gap-2">
            <ListOrdered className="size-4 text-primary" aria-hidden />
            {formatExerciseCount(plan.exercises.length)}
          </li>
        </ul>
      </div>
    </header>
  );
}
