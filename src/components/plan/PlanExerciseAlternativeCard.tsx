import { Clock3, Dumbbell, Tag } from "lucide-react";

import { RatingMeter } from "@/components/exercise/RatingMeter";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import { ExerciseImage } from "@/components/shared/ExerciseImage";
import type { ExerciseRatingKey } from "@/components/exercise/exerciseRatings";
import type { CatalogReference } from "@/types/exercise";
import { PLAN_RATING_COLUMNS, PLAN_RATING_GRID_CLASS } from "./planRatings";

type CardProps = {
  name: string;
  imageUrl: string | null;
  number: number;
  equipment: CatalogReference[];
  trainingTypes: CatalogReference[];
  ratings: Record<ExerciseRatingKey, number>;
  duration?: number;
  similarity?: number;
  selection?: { checked: boolean; onChange: () => void; disabled: boolean };
};

export function PlanExerciseAlternativeCard({
  name,
  imageUrl,
  number,
  equipment,
  trainingTypes,
  ratings,
  duration,
  similarity,
  selection,
}: CardProps) {
  const ratingMeters = (
    <div
      className={`${PLAN_RATING_GRID_CLASS} lg:max-w-96 lg:[&_[role=meter]>span]:h-1`}
    >
      {PLAN_RATING_COLUMNS.map((column) => (
        <RatingMeter
          key={column.key}
          label={column.label}
          value={ratings[column.key]}
          fillClass={column.fillClass}
          showLabel={false}
        />
      ))}
    </div>
  );
  const badges = (
    <>
      {trainingTypes.map((item) => (
        <CardItemBadge
          key={item.id}
          icon={<Tag className="size-3" aria-hidden />}
          className="border border-border px-2 py-0.5 text-xs text-foreground"
        >
          {item.name}
        </CardItemBadge>
      ))}
      {equipment.length ? (
        equipment.map((item) => (
          <CardItemBadge
            key={item.id}
            icon={<Dumbbell className="size-3" aria-hidden />}
            className="border border-primary/60 px-2 py-0.5 text-xs text-primary"
          >
            {item.name}
          </CardItemBadge>
        ))
      ) : (
        <CardItemBadge className="border border-border px-2 py-0.5 text-xs text-muted-foreground">
          Brak sprzętu
        </CardItemBadge>
      )}
    </>
  );
  const content = (
    <div className="flex min-w-0 flex-1 self-start flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <span className="break-words font-semibold text-foreground">
          {name}
        </span>
        {similarity !== undefined ? (
          <span
            className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
            aria-label={`Podobieństwo ${Math.round(similarity * 100)}%`}
          >
            {Math.round(similarity * 100)}%
          </span>
        ) : duration !== undefined ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            {duration} min
          </span>
        ) : null}
      </div>
    </div>
  );
  const inner = (
    <>
      <span className="flex h-14 w-5 shrink-0 items-center justify-center self-start text-sm font-semibold text-primary">
        {number}
      </span>
      <ExerciseImage
        src={imageUrl}
        className="size-14 shrink-0 self-start rounded-xl bg-muted object-cover"
      />
      {content}
      {selection ? (
        <input
          type="radio"
          name="plan-exercise-alternative"
          aria-label={`Wybierz ${name}`}
          checked={selection.checked}
          onChange={selection.onChange}
          disabled={selection.disabled}
          className="size-4 shrink-0 accent-primary"
        />
      ) : null}
    </>
  );
  return selection ? (
    <label className="flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 lg:gap-3">{inner}</div>
      <div className="flex flex-wrap gap-1">{badges}</div>
      {ratingMeters}
    </label>
  ) : (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-3">{inner}</div>
      <div className="flex flex-wrap gap-1">{badges}</div>
      {ratingMeters}
    </div>
  );
}
