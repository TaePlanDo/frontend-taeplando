import { Ban, Dumbbell, Layers3, Pencil, Tag, Trash2 } from "lucide-react";
import { cn } from "cn";

import { Card } from "@/components/ui/card";
import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import { ExerciseImage } from "@/components/shared/ExerciseImage";
import type { Exercise } from "@/types/exercise";

import { AttributeBadges } from "./AttributeBadges";

type ExerciseCardItemProps = {
  exercise: Exercise;
  isOffline?: boolean;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void | Promise<void>;
};

export function ExerciseCardItem({
  exercise,
  isOffline = false,
  onEdit,
  onView,
  onDelete,
}: ExerciseCardItemProps) {
  const types = exercise.training_types.map(({ name }) => name);
  const segments = exercise.segments.map(({ name }) => name);
  const equipment = exercise.equipment.map(({ name }) => name);
  const isExcluded = exercise.status === "SUSPENDED";

  return (
    <Card className="relative flex-row gap-4 rounded-2xl border-border bg-transparent p-4 shadow-none transition-colors hover:border-primary focus-within:border-primary">
      <button
        type="button"
        aria-label={`Pokaż szczegóły: ${exercise.name}`}
        className="absolute inset-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={onView}
      />
      <ExerciseImage
        src={exercise.image_url}
        forceFallback={isOffline}
        className="pointer-events-none size-22 shrink-0 rounded-2xl bg-muted object-cover"
      />
      <div className="pointer-events-none flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex min-w-0 items-center gap-2 text-lg font-semibold">
            {isExcluded ? (
              <>
                <Ban
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="sr-only">Wykluczone ćwiczenie: </span>
              </>
            ) : null}
            <span
              className={cn(
                "truncate",
                isExcluded && "text-muted-foreground line-through",
              )}
            >
              {exercise.name}
            </span>
          </h3>
        </div>
        <div className="flex flex-col gap-1.5">
          <AttributeBadges
            label="Typ"
            names={types}
            icon={<Tag className="size-3" />}
            className="border border-primary/50 bg-primary/10 text-primary"
            maxItems={2}
          />
          <AttributeBadges
            label="Segment"
            names={segments}
            icon={<Layers3 className="size-3" />}
            className="border border-secondary/50 bg-secondary/10 text-secondary"
            maxItems={2}
          />
          <AttributeBadges
            label="Sprzęt"
            names={equipment}
            icon={<Dumbbell className="size-3" />}
            className="border border-foreground/20 bg-muted text-foreground/80"
            maxItems={2}
          />
        </div>
        <div className="relative mt-auto flex justify-end gap-1">
          {exercise.scope === "PRIVATE" ? (
            <CardItemActionButton
              icon={<Pencil className="size-4" />}
              className="pointer-events-auto"
              onClick={onEdit}
            >
              Edytuj
            </CardItemActionButton>
          ) : null}
          {exercise.scope === "PRIVATE" ? (
            <CustomizedAlertDialog
              trigger={
                <CardItemActionButton
                  icon={<Trash2 className="size-4" />}
                  className="pointer-events-auto text-primary"
                >
                  Usuń
                </CardItemActionButton>
              }
              title="Usuwanie ćwiczenia"
              message={`Czy na pewno chcesz usunąć „${exercise.name}”? Tej operacji nie da się cofnąć.`}
              onSubmit={onDelete}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
