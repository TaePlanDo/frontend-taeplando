import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Exercise } from "@/types/exercise";

import { AttributeRow } from "./AttributeRow";
import { ExerciseStatBlock } from "./ExerciseStatBlock";

type ExerciseReadonlyModalProps = {
  exercise: Exercise | null;
  onEdit: () => void;
};

export function ExerciseReadonlyModal({
  exercise,
  onEdit,
}: ExerciseReadonlyModalProps) {
  if (!exercise) return null;

  const equipment = exercise.equipment.map(({ name }) => name);
  const trainingTypes = exercise.training_types.map(({ name }) => name);
  const segments = exercise.segments.map(({ name }) => name);

  const age = `${exercise.min_age}-${exercise.max_age} lat`;
  const participants = `${exercise.min_participants}-${exercise.max_participants} osób`;
  const duration = `${exercise.duration_minutes} minut`;

  const stats = (
    <>
      <ExerciseStatBlock label="Wiek" value={age} />
      <ExerciseStatBlock label="Liczba uczestników" value={participants} />
      <ExerciseStatBlock label="Czas trwania" value={duration} />
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ScrollArea
        type="always"
        className="h-full min-h-0 flex-1 overflow-hidden px-1"
      >
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex flex-row gap-6 mt-6">
            <img
              src={exercise.image_url ?? "/exercise-icon.png"}
              alt=""
              className="size-52 shrink-0 self-start rounded-2xl bg-muted object-cover my-auto"
              onError={(event) => {
                event.currentTarget.src = "/exercise-icon.png";
              }}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="text-2xl font-semibold text-foreground">
                {exercise.name}
              </h1>
              <p className="mt-2 text-sm break-words pr-4 text-muted-foreground">
                {exercise.description}
              </p>
              <div className="mt-auto hidden flex-row gap-4 pt-4 lg:flex">
                {stats}
              </div>
            </div>
          </div>
          <div className="lg:hidden flex-row gap-4 flex">{stats}</div>

          <div className="flex flex-col gap-2 mt-4">
            <h2 className="text-lg font-semibold text-foreground">
              Atrybuty dodatkowe
            </h2>

            <div className="flex flex-col gap-4 border-2 rounded-2xl p-4 mt-4">
              <AttributeRow
                label="Sprzęt"
                names={equipment}
                className="border border-foreground/20 bg-muted text-foreground/80"
              />
              <Separator />
              <AttributeRow
                label="Typ"
                names={trainingTypes}
                className="border border-primary/50 bg-primary/10 text-primary"
              />
              <Separator />
              <AttributeRow
                label="Segment"
                names={segments}
                className="border border-secondary/50 bg-secondary/10 text-secondary"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="-mx-4 flex shrink-0 border-t bg-background px-4 pt-4 pb-2 sm:-mx-6 sm:justify-end sm:px-6">
        <CustomizedButton
          variant="primary"
          className="w-full sm:w-54"
          onClick={onEdit}
        >
          Edytuj ćwiczenie
        </CustomizedButton>
      </div>
    </div>
  );
}
