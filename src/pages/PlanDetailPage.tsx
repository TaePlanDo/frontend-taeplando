import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PlanDetailHeader } from "@/components/plan/PlanDetailHeader";
import { PlanExerciseAlternativesSheet } from "@/components/plan/PlanExerciseAlternativesSheet";
import { PlanEquipmentSection } from "@/components/plan/PlanEquipmentSection";
import { PlanPhaseSection } from "@/components/plan/PlanPhaseSection";
import { PlanSummaryCards } from "@/components/plan/PlanSummaryCards";
import { RegeneratePlanDialog } from "@/components/plan/RegeneratePlanDialog";
import {
  CenteredLoading,
  CenteredStatus,
} from "@/components/shared/CenteredStatus";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { HomeLink } from "@/components/shared/HomeLink";
import { useDeletePlan } from "@/hooks/plans/useDeletePlan";
import { usePlan } from "@/hooks/plans/usePlan";
import { usePlanExerciseMutations } from "@/hooks/plans/usePlanExerciseMutations";
import { groupPlanPhases } from "@/lib/plan/phaseGrouping";
import type { PlanExercise } from "@/types/plan";

export function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const backTo: string = useLocation().state?.backTo ?? "/plans";
  const { plan, isLoading, isFetching, isError, refetch } = usePlan(planId);
  const { deletePlan } = useDeletePlan();
  const { replace, remove } = usePlanExerciseMutations();
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [selected, setSelected] = useState<{
    exercise: PlanExercise;
    number: number;
  } | null>(null);
  async function handleReplace(exerciseId: string) {
    if (!plan || !selected) return;
    try {
      await replace.mutate({
        planId: plan.id,
        planExerciseId: selected.exercise.id,
        exerciseId,
      });
      setSelected(null);
      toast.success("Ćwiczenie zostało wymienione");
      await refetch();
    } catch {
      // The mutation error is displayed in the alternatives panel.
    }
  }

  async function handleRemove(exercise: PlanExercise) {
    if (!plan) return;
    try {
      await remove.mutate({ planId: plan.id, planExerciseId: exercise.id });
      toast.success("Ćwiczenie zostało usunięte z planu");
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nie udało się usunąć ćwiczenia.",
      );
    }
  }

  async function handleDelete() {
    if (!plan) {
      return;
    }

    try {
      await deletePlan(plan.id);
      toast.success("Plan został usunięty");
      navigate(backTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  if (isLoading) {
    return <CenteredLoading label="Ładowanie planu…" />;
  }

  if (!plan) {
    return (
      <CenteredStatus
        message="Nie udało się wczytać planu treningowego."
        actions={
          <div className="flex flex-wrap justify-center gap-3">
            <CustomizedButton
              variant="outline"
              className="w-auto px-6"
              onClick={() => void refetch()}
            >
              Spróbuj ponownie
            </CustomizedButton>
            <HomeLink />
          </div>
        }
      />
    );
  }

  const phases = groupPlanPhases(plan);

  return (
    <div className="flex flex-1 justify-center px-3 py-6 lg:px-6">
      <div className="mb-12 flex w-full max-w-96 flex-col gap-8 lg:max-w-220">
        <PlanDetailHeader
          plan={plan}
          backTo={backTo}
          onBack={() => navigate(backTo)}
          onRegenerate={() => setRegenerateOpen(true)}
          onDelete={handleDelete}
        />

        <PlanSummaryCards plan={plan} />

        <PlanEquipmentSection equipment={plan.available_equipment_snapshot} />

        <div className="flex flex-col gap-3">
          {phases.map((phase) => (
            <PlanPhaseSection
              key={phase.schema.position}
              phase={phase}
              onReplace={(exercise, number) => {
                replace.reset();
                setSelected({ exercise, number });
              }}
              onRemove={handleRemove}
              replacingExerciseId={selected?.exercise.id}
              disabled={
                selected !== null ||
                replace.isPending ||
                remove.isPending ||
                isFetching ||
                isError
              }
            />
          ))}
        </div>

        <PlanExerciseAlternativesSheet
          planId={plan.id}
          exercise={selected?.exercise ?? null}
          number={selected?.number ?? 0}
          open={selected !== null}
          onOpenChange={(open) => {
            if (!open && !replace.isPending) {
              setSelected(null);
              replace.reset();
            }
          }}
          onReplace={(exerciseId) => void handleReplace(exerciseId)}
          isReplacing={replace.isPending}
          disabled={isFetching || isError}
          replaceError={
            isError
              ? "Nie udało się odświeżyć planu. Zamknij panel i spróbuj ponownie."
              : replace.error
          }
        />

        <RegeneratePlanDialog
          plan={plan}
          open={regenerateOpen}
          onOpenChange={setRegenerateOpen}
          onStarted={(jobId) => navigate(`/plans/generation/${jobId}`)}
        />
      </div>
      {isError ? (
        <div
          role="alert"
          className="fixed right-4 bottom-4 z-40 flex flex-wrap items-center gap-3 rounded-xl border border-destructive bg-background p-4 text-sm text-destructive shadow-lg"
        >
          <span>Nie udało się odświeżyć planu.</span>
          <CustomizedButton
            type="button"
            className="w-auto"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            Spróbuj ponownie
          </CustomizedButton>
        </div>
      ) : isFetching ? (
        <div
          role="status"
          className="fixed right-4 bottom-4 z-40 rounded-xl border border-border bg-background p-4 text-sm shadow-lg"
        >
          Odświeżanie planu…
        </div>
      ) : null}
    </div>
  );
}
