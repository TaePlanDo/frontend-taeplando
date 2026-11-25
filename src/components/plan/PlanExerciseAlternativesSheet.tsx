import { useState } from "react";

import { EmptyListView } from "@/components/shared/EmptyListView";
import { ErrorListView } from "@/components/shared/ErrorListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSheet } from "@/components/shared/CustomizedSheet";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { usePlanExerciseAlternatives } from "@/hooks/plans/usePlanExerciseAlternatives";
import { mapPlanExerciseToSnapshot } from "@/lib/mappers/plan";
import type { PlanExercise } from "@/types/plan";
import { PlanExerciseAlternativeCard } from "./PlanExerciseAlternativeCard";

type Props = {
  planId: string;
  exercise: PlanExercise | null;
  number: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplace: (exerciseId: string) => void;
  isReplacing?: boolean;
  disabled?: boolean;
  replaceError?: string | null;
};

export function PlanExerciseAlternativesSheet({
  open,
  onOpenChange,
  exercise,
  ...props
}: Props) {
  return (
    <CustomizedSheet
      title="Wymień ćwiczenie"
      desktopWidth={480}
      modalOnDesktop
      open={open}
      onOpenChange={onOpenChange}
    >
      {open && exercise ? (
        <AlternativesContent
          key={exercise.id}
          exercise={exercise}
          onOpenChange={onOpenChange}
          {...props}
        />
      ) : null}
    </CustomizedSheet>
  );
}

function AlternativesContent({
  planId,
  exercise,
  number,
  onOpenChange,
  onReplace,
  isReplacing = false,
  disabled = false,
  replaceError,
}: Omit<Props, "open"> & { exercise: PlanExercise }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = usePlanExerciseAlternatives(planId, exercise.id);
  const alternatives = query.data ?? [];
  const canReplace =
    !query.isError &&
    !query.isFetching &&
    !disabled &&
    alternatives.some((item) => item.exercise_id === selectedId) &&
    !isReplacing;
  const source = mapPlanExerciseToSnapshot(exercise);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 pb-4">
          <h3 className="mb-2 font-semibold text-foreground">
            Wymieniane ćwiczenie
          </h3>
          <PlanExerciseAlternativeCard
            name={source.name}
            imageUrl={source.image_url}
            imageUrlLight={source.image_url_light}
            number={number}
            equipment={source.equipment}
            trainingTypes={source.training_types}
            ratings={source}
            duration={source.duration_minutes}
          />
        </div>
        <h3 className="shrink-0 border-t border-border py-4 font-semibold text-primary">
          Propozycje{query.data ? ` (${alternatives.length})` : ""}
        </h3>
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {query.isPending || (query.isFetching && !query.isError) ? (
            <LoadingSpinner className="h-92" />
          ) : query.isError ? (
            <ErrorListView
              title="Nie udało się pobrać ćwiczeń zamiennych"
              message="Spróbuj ponownie za chwilę."
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          ) : alternatives.length === 0 ? (
            <EmptyListView
              title="Brak ćwiczeń zamiennych"
              message="Nie znaleziono ćwiczeń pasujących do tego planu."
            />
          ) : (
            <fieldset
              className="flex flex-col gap-2"
              disabled={isReplacing || disabled}
            >
              <legend className="sr-only">Wybierz ćwiczenie zamienne</legend>
              {alternatives.map((item, index) => (
                <PlanExerciseAlternativeCard
                  key={item.exercise_id}
                  name={item.name}
                  imageUrl={item.image_url}
                  imageUrlLight={item.image_url_light}
                  number={index + 1}
                  equipment={item.equipment}
                  trainingTypes={item.training_types}
                  ratings={item}
                  similarity={item.similarity_score}
                  selection={{
                    checked: selectedId === item.exercise_id,
                    onChange: () => setSelectedId(item.exercise_id),
                    disabled: isReplacing || disabled,
                  }}
                />
              ))}
            </fieldset>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-3 border-t border-border pt-4">
        {replaceError ? <InputErrorMessage message={replaceError} /> : null}
        <div className="flex gap-3">
          <CustomizedButton
            type="button"
            className="flex-1"
            disabled={isReplacing}
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </CustomizedButton>
          <CustomizedButton
            type="button"
            variant="primary"
            className="flex-1"
            disabled={!canReplace}
            onClick={() => {
              if (selectedId) onReplace(selectedId);
            }}
          >
            {isReplacing ? "Zapisywanie…" : "Wymień ćwiczenie"}
          </CustomizedButton>
        </div>
      </div>
    </div>
  );
}
