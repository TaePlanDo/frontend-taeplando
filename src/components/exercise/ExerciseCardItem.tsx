import { Dumbbell, Eye, Layers3, Pencil, Tag, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import { CardItemBadge } from "@/components/shared/CardItemBadge";
import type { Exercise } from "@/types/exercise";

type ExerciseCardItemProps = {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
};

type AttributeBadgesProps = {
  label: string;
  names: string[];
  icon: ReactNode;
  className: string;
};

function AttributeBadges({
  label,
  names,
  icon,
  className,
}: AttributeBadgesProps) {
  const visibleNames = names.slice(0, 2);
  const hiddenNames = names.slice(2);

  if (!names.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1" aria-label={label}>
      {visibleNames.map((name) => (
        <CardItemBadge key={name} icon={icon} className={className}>
          {name}
        </CardItemBadge>
      ))}
      {hiddenNames.length ? (
        <CardItemBadge
          className={className}
          title={hiddenNames.join(", ")}
          aria-label={`${label}: dodatkowo ${hiddenNames.join(", ")}`}
        >
          +{hiddenNames.length}
        </CardItemBadge>
      ) : null}
    </div>
  );
}

export function ExerciseCardItem({
  exercise,
  onEdit,
  onDelete,
}: ExerciseCardItemProps) {
  const types = exercise.training_types.map(({ name }) => name);
  const segments = exercise.segments.map(({ name }) => name);
  const equipment = exercise.equipment.map(({ name }) => name);

  return (
    <Card className="flex-row gap-4 rounded-2xl bg-transparent p-4 shadow-none">
      <img
        src={exercise.image_url ?? "/exercise-icon.png"}
        alt=""
        className="size-22 shrink-0 rounded-2xl bg-muted object-cover"
        onError={(event) => {
          event.currentTarget.src = "/exercise-icon.png";
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-semibold">{exercise.name}</h3>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-xs text-secondary"
            aria-label={`Pokaż szczegóły: ${exercise.name}`}
          >
            <Eye className="size-5" aria-hidden />
            <span className="hidden sm:inline">Szczegóły</span>
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <AttributeBadges
            label="Typ"
            names={types}
            icon={<Tag className="size-3" />}
            className="border border-primary/50 bg-primary/10 text-primary"
          />
          <AttributeBadges
            label="Segment"
            names={segments}
            icon={<Layers3 className="size-3" />}
            className="border border-secondary/50 bg-secondary/10 text-secondary"
          />
          <AttributeBadges
            label="Sprzęt"
            names={equipment}
            icon={<Dumbbell className="size-3" />}
            className="border border-foreground/20 bg-muted text-foreground/80"
          />
        </div>
        <div className="mt-auto flex justify-end gap-1">
          {exercise.scope === "PRIVATE" ? (
            <CardItemActionButton
              icon={<Pencil className="size-4" />}
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
                  className="text-primary"
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
