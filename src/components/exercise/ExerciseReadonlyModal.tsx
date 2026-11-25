import { Dumbbell, Layers3, Tag } from "lucide-react";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSwitch } from "@/components/shared/CustomizedSwitch";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Exercise, ExerciseDetails } from "@/types/exercise";

import { AttributeRow } from "./AttributeRow";
import { ExerciseStatBlock } from "./ExerciseStatBlock";
import { ExercisePreviewMedia } from "./ExercisePreviewMedia";
import { EXERCISE_RATING_COLUMNS } from "./exerciseRatings";
import { RatingMeter } from "./RatingMeter";

type ExerciseReadonlyModalProps = {
  onClose: () => void;
} & (
  | { kind: "snapshot"; exercise: ExerciseDetails }
  | {
      kind: "editable";
      exercise: Exercise;
      onEdit: () => void;
      onExclusionChange: (excluded: boolean) => void;
      exclusionDisabled: boolean;
    }
);

export function ExerciseReadonlyModal(props: ExerciseReadonlyModalProps) {
  const { exercise, onClose } = props;

  const equipment = exercise.equipment.map(({ name }) => name);
  const trainingTypes = exercise.training_types.map(({ name }) => name);
  const segments = exercise.segments.map(({ name }) => name);

  const age = `${exercise.min_age}-${exercise.max_age} lat`;
  const participants = `${exercise.min_participants}-${exercise.max_participants} osób`;
  const duration = `${exercise.duration_minutes} minut`;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ScrollArea
        type="always"
        className="h-full min-h-0 flex-1 overflow-hidden px-1"
      >
        <div className="flex flex-col gap-4 pr-4 pb-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <ExercisePreviewMedia exercise={exercise} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-2xl font-semibold text-foreground">
                  {exercise.name}
                </h1>
                {props.kind === "editable" && (
                  <CustomizedSwitch
                    label="Wyklucz ćwiczenie"
                    checked={props.exercise.status === "SUSPENDED"}
                    onCheckedChange={props.onExclusionChange}
                    disabled={props.exclusionDisabled}
                  />
                )}
              </div>
              <p className="mt-2 text-sm break-words pr-4 text-muted-foreground">
                {exercise.description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            <ExerciseStatBlock label="Wiek" value={age} />
            <ExerciseStatBlock
              label="Liczba uczestników"
              value={participants}
            />
            <ExerciseStatBlock label="Czas trwania" value={duration} />
          </div>
          <div className="grid grid-cols-1 gap-4 rounded-2xl border-2 p-4 sm:grid-cols-2 sm:gap-6">
            {[
              EXERCISE_RATING_COLUMNS.slice(0, 2),
              EXERCISE_RATING_COLUMNS.slice(2),
            ].map((columns, index) => (
              <div key={index} className="flex min-w-0 flex-col gap-4">
                {columns.map((column) => (
                  <RatingMeter
                    key={column.key}
                    label={column.label}
                    value={exercise[column.key]}
                    fillClass={column.fillClass}
                  />
                ))}
              </div>
            ))}
          </div>

          <section className="space-y-3 border-y border-foreground/15 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span className="h-4 w-1 rounded-full bg-primary" aria-hidden />
              Atrybuty dodatkowe
            </h2>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <AttributeRow
                label="Sprzęt"
                names={equipment}
                icon={<Dumbbell className="size-5" />}
                badgeClassName="border border-foreground/20 bg-muted text-foreground/80"
              />
              <AttributeRow
                label="Typ"
                names={trainingTypes}
                icon={<Tag className="size-5" />}
                badgeClassName="border border-primary/50 bg-primary/10 text-primary"
              />
              <AttributeRow
                label="Segment"
                names={segments}
                icon={<Layers3 className="size-5" />}
                badgeClassName="border border-foreground/20 bg-muted text-foreground/80"
              />
            </ul>
          </section>
        </div>
      </ScrollArea>
      <div className="-mx-4 flex shrink-0 flex-col-reverse gap-2 border-t bg-background px-4 py-1 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
        <CustomizedButton
          variant="outline"
          className="w-full sm:w-32"
          onClick={onClose}
        >
          Zamknij
        </CustomizedButton>
        {props.kind === "editable" && props.exercise.scope === "PRIVATE" ? (
          <CustomizedButton
            variant="primary"
            className="w-full sm:w-54"
            onClick={props.onEdit}
          >
            Edytuj ćwiczenie
          </CustomizedButton>
        ) : null}
      </div>
    </div>
  );
}
