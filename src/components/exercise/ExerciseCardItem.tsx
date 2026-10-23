import { Eye, Pencil, Trash2 } from "lucide-react";

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

export function ExerciseCardItem({
  exercise,
  onEdit,
  onDelete,
}: ExerciseCardItemProps) {
  const typeLabel = exercise.training_types.map(({ name }) => name).join(", ");
  const segmentLabel = exercise.segments.map(({ name }) => name).join(", ");

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
        <div className="flex flex-wrap gap-2">
          <CardItemBadge>{typeLabel || "Brak typu"}</CardItemBadge>
          <CardItemBadge>{segmentLabel || "Brak segmentu"}</CardItemBadge>
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
