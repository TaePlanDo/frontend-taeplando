import { Clock, Trash2, Users } from "lucide-react";

import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format/date-to-text";
import { formatParticipantCount } from "@/lib/format/plural";
import { formatDuration } from "@/lib/format/time";
import type { PlanListItem } from "@/types/plan";

type PlanCardItemProps = {
  plan: PlanListItem;
  onOpen: () => void;
  onDelete: () => void | Promise<void>;
};

export function PlanCardItem({ plan, onOpen, onDelete }: PlanCardItemProps) {
  const trainingType = plan.training_types_snapshot[0]?.name;

  return (
    <Card
      role="link"
      tabIndex={0}
      className="cursor-pointer gap-3 rounded-2xl border-border bg-transparent py-4 text-foreground shadow-none transition-colors hover:border-primary"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 px-5">
        {trainingType ? (
          <CardItemBadge className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground/80">
            {trainingType}
          </CardItemBadge>
        ) : null}
        <span className="ml-auto shrink-0 text-xs text-foreground/60">
          Utworzono {formatRelativeTime(plan.generated_at)}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-5">
        <h3 className="line-clamp-2 text-lg font-semibold">{plan.name}</h3>
        <p className="text-sm text-foreground/60">
          Grupa:{" "}
          <span className="font-medium text-foreground/80">
            {plan.group_name_snapshot}
          </span>
        </p>
      </CardContent>
      <CardFooter className="items-center justify-between gap-2 px-5">
        <div className="flex flex-wrap gap-2">
          <CardItemBadge
            icon={<Clock className="size-4" />}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-foreground"
          >
            {formatDuration(plan.training_duration_snapshot)}
          </CardItemBadge>
          <CardItemBadge
            icon={<Users className="size-4" />}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-foreground"
          >
            {formatParticipantCount(plan.participant_count)}
          </CardItemBadge>
        </div>
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <CustomizedAlertDialog
            trigger={
              <CardItemActionButton
                icon={<Trash2 className="size-4" />}
                className="text-primary hover:bg-primary/10"
              >
                Usuń
              </CardItemActionButton>
            }
            title="Usuwanie planu"
            message={`Czy na pewno chcesz usunąć „${plan.name}”? Tej operacji nie da się cofnąć.`}
            onSubmit={onDelete}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
