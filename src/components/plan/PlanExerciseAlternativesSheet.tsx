import { useState } from "react";

import { ListStateView } from "@/components/shared/ListStateView";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSheet } from "@/components/shared/CustomizedSheet";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { getPaginatedListState } from "@/hooks/pagination/listState";
import { usePlanExerciseAlternatives } from "@/hooks/plans/usePlanExerciseAlternatives";
import { useOnlineState } from "@/hooks/useOnlineState";
import { mapPlanExerciseToSnapshot } from "@/lib/mappers/plan";
import type { PlanExercise } from "@/types/plan";
import { PlanExerciseAlternativeCard } from "./PlanExerciseAlternativeCard";
import { PLAN_RATING_COLUMNS } from "./planRatings";

type Props = {
  planId: string;
  exercise: PlanExercise | null;
  number: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplace: (exerciseId: string) => void;
  isReplacing?: boolean;
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
  replaceError,
}: Omit<Props, "open"> & { exercise: PlanExercise }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = usePlanExerciseAlternatives(planId, exercise.id);
  const isOnline = useOnlineState();
  const alternatives = query.data ?? [];
  const state = getPaginatedListState({
    hasData: query.data !== undefined,
    isOnline,
    isLoading: query.isPending,
    isError: query.isError,
    isEmpty: alternatives.length === 0,
  });
  const canReplace =
    state.kind === "ready" &&
    alternatives.some((item) => item.exercise_id === selectedId) &&
    !isReplacing;
  const source = mapPlanExerciseToSnapshot(exercise);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
          {PLAN_RATING_COLUMNS.map((column) => (
            <span key={column.key} className={column.headerClass}>
              ● {column.label}
            </span>
          ))}
        </div>
        <PlanExerciseAlternativeCard
          name={source.name}
          imageUrl={source.image_url}
          number={number}
          equipment={source.equipment}
          trainingTypes={source.training_types}
          ratings={source}
          duration={source.duration_minutes}
        />
        <h3 className="border-t border-border pt-4 font-semibold text-primary">
          Propozycje{query.data ? ` (${alternatives.length})` : ""}
        </h3>
        <ListStateView
          state={state}
          errorTitle="Nie udało się pobrać ćwiczeń zamiennych"
          errorMessage="Spróbuj ponownie za chwilę."
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
          emptyTitle="Brak ćwiczeń zamiennych"
          emptyMessage="Nie znaleziono ćwiczeń pasujących do tego planu."
        >
          <fieldset className="flex flex-col gap-2" disabled={isReplacing}>
            <legend className="sr-only">Wybierz ćwiczenie zamienne</legend>
            {alternatives.map((item, index) => (
              <PlanExerciseAlternativeCard
                key={item.exercise_id}
                name={item.name}
                imageUrl={item.image_url}
                number={index + 1}
                equipment={item.equipment}
                trainingTypes={item.training_types}
                ratings={item}
                similarity={item.similarity_score}
                selection={{
                  checked: selectedId === item.exercise_id,
                  onChange: () => setSelectedId(item.exercise_id),
                  disabled: isReplacing || state.kind !== "ready",
                }}
              />
            ))}
          </fieldset>
        </ListStateView>
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
