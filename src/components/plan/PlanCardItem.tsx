import { Clock, Tag, Trash2, Users } from "lucide-react";

import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatMediumDate } from "@/lib/format/date-to-text";
import { formatParticipantCount } from "@/lib/format/plural";
import { formatDuration } from "@/lib/format/time";
import type { PlanListItem } from "@/types/plan";

type PlanCardItemBase = {
  plan: PlanListItem;
  onOpen: () => void;
};

type PlanCardItemProps = PlanCardItemBase &
  (
    | { variant?: "list"; onDelete: () => void | Promise<void> }
    | { variant: "choice"; onDelete?: never }
  );

export function PlanCardItem(props: PlanCardItemProps) {
  const { plan, onOpen } = props;
  const isChoice = props.variant === "choice";
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
      <CardHeader className="gap-0 px-5">
        {trainingType ? (
          <CardItemBadge
            icon={<Tag className="size-3" />}
            className="border border-primary/50 bg-primary/10 text-primary"
          >
            {trainingType}
          </CardItemBadge>
        ) : null}
        <CardAction className="text-xs text-foreground/80">
          Utworzono {formatMediumDate(plan.generated_at)}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 px-5">
        <h3 className="line-clamp-2 text-lg font-semibold">{plan.name}</h3>
        {isChoice ? null : (
          <p className="text-sm text-foreground/60">
            Grupa:{" "}
            <span className="font-medium text-foreground/80">
              {plan.group_name_snapshot}
            </span>
          </p>
        )}
      </CardContent>
      <CardFooter className="items-center justify-between gap-2 px-5">
        <div className="flex flex-wrap gap-2">
          <CardItemBadge icon={<Clock className="h-5 w-5" />}>
            {formatDuration(plan.training_duration_snapshot)}
          </CardItemBadge>
          <CardItemBadge icon={<Users className="h-5 w-5" />}>
            {formatParticipantCount(plan.participant_count)}
          </CardItemBadge>
        </div>
        {isChoice ? null : (
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
              onSubmit={props.onDelete}
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
