import { CalendarDays, Clock3, Dumbbell, Users } from "lucide-react";

import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { ExerciseImage } from "@/components/shared/ExerciseImage";
import { cn } from "cn";
import type { PlanExercise } from "@/types/plan";

import { PLAN_RATING_COLUMNS, PLAN_RATING_COLUMNS_CLASS } from "./planRatings";
import { RatingMeter } from "./RatingMeter";

type PlanExerciseRowProps = {
  exercise: PlanExercise;
  index: number;
};

export function PlanExerciseRow({ exercise, index }: PlanExerciseRowProps) {
  const equipment = exercise.equipment_snapshot;
  const trainingTypes = exercise.training_types_snapshot;

  return (
    <article className="flex flex-col gap-4 border-b border-border py-4 last:border-b-0 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        <div className="relative shrink-0">
          <ExerciseImage
            src={exercise.image_url_snapshot}
            className="size-16 rounded-xl bg-muted object-cover sm:size-20"
          />
          <span className="absolute -left-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-foreground">
            {index}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h4 className="text-base font-semibold text-foreground sm:text-lg">
            {exercise.name_snapshot}
          </h4>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5 text-primary" aria-hidden />
              {exercise.duration_minutes_snapshot} min
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" aria-hidden />
              {exercise.min_participants_snapshot}–
              {exercise.max_participants_snapshot} os.
            </li>
            <li className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-primary" aria-hidden />
              {exercise.min_age_snapshot}–{exercise.max_age_snapshot} lat
            </li>
          </ul>
          <div className="flex flex-wrap gap-1.5">
            {trainingTypes.map((type) => (
              <CardItemBadge
                key={type.id}
                className="border border-foreground/25 bg-transparent px-2.5 py-0.5 text-foreground/80"
              >
                {type.name}
              </CardItemBadge>
            ))}
            {equipment.length ? (
              equipment.map((item) => (
                <CardItemBadge
                  key={item.id}
                  icon={<Dumbbell className="size-3" aria-hidden />}
                  className="border border-primary/60 bg-transparent px-2.5 py-0.5 text-primary"
                >
                  {item.name}
                </CardItemBadge>
              ))
            ) : (
              <CardItemBadge className="border border-foreground/20 bg-transparent px-2.5 py-0.5 text-muted-foreground">
                Brak sprzętu
              </CardItemBadge>
            )}
          </div>
        </div>
      </div>

      <div className={cn(PLAN_RATING_COLUMNS_CLASS, "lg:shrink-0")}>
        {PLAN_RATING_COLUMNS.map((column) => (
          <RatingMeter
            key={column.key}
            label={column.label}
            value={exercise[column.key]}
            fillClass={column.fillClass}
            showLabel={false}
          />
        ))}
      </div>
    </article>
  );
}
