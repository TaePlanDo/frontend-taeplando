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
  const { plan, isLoading, isError, refetch } = usePlan(planId);
  const { deletePlan } = useDeletePlan();
  const { replace, remove } = usePlanExerciseMutations();
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [selected, setSelected] = useState<{
    exercise: PlanExercise;
    number: number;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  async function refreshPlan() {
    setSyncing(true);
    try {
      const result = await refetch();
      setSyncError(result.isError);
      return result.data;
    } finally {
      setSyncing(false);
    }
  }

  async function handleReplace(exerciseId: string) {
    if (!plan || !selected) return;
    const slot = selected.exercise;
    try {
      await replace.mutate({
        planId: plan.id,
        planExerciseId: slot.id,
        exerciseId,
      });
      setSelected(null);
      await refreshPlan();
      toast.success("Ćwiczenie zostało wymienione");
    } catch {
      const current = await refreshPlan();
      const updated = current?.exercises.find((item) => item.id === slot.id);
      if (current && (!updated || updated.exercise_id !== slot.exercise_id)) {
        setSelected(null);
        toast.error("Plan uległ zmianie. Sprawdź aktualną listę ćwiczeń.");
      }
    }
  }

  async function handleRemove(exercise: PlanExercise) {
    if (!plan) return;
    try {
      await remove.mutate({ planId: plan.id, planExerciseId: exercise.id });
      await refreshPlan();
      toast.success("Ćwiczenie zostało usunięte z planu");
    } catch (error) {
      const current = await refreshPlan();
      if (
        current &&
        !current.exercises.some((item) => item.id === exercise.id)
      ) {
        toast.error("Plan uległ zmianie. Sprawdź aktualną listę ćwiczeń.");
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Nie udało się usunąć ćwiczenia.",
        );
      }
    }
  }

  async function refreshSelectedPlan() {
    const current = await refreshPlan();
    const updated = current?.exercises.find(
      (item) => item.id === selected?.exercise.id,
    );
    if (
      current &&
      (!updated || updated.exercise_id !== selected?.exercise.exercise_id)
    ) {
      setSelected(null);
      toast.error("Plan uległ zmianie. Sprawdź aktualną listę ćwiczeń.");
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

  if (!plan && (isError || !isLoading)) {
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

  if (!plan) return null;

  const phases = groupPlanPhases(plan);

  return (
    <div className="flex flex-1 justify-center px-3 py-6 sm:px-6">
      <div
        className={`mb-12 flex w-full max-w-96 flex-col gap-8 transition-transform duration-300 lg:max-w-220 ${selected ? "lg:translate-x-[clamp(0px,calc(944px_-_50vw),480px)]" : ""}`}
      >
        <PlanDetailHeader
          plan={plan}
          backTo={backTo}
          onBack={() => navigate(backTo)}
          onRegenerate={() => setRegenerateOpen(true)}
          onDelete={handleDelete}
        />

        <PlanSummaryCards plan={plan} />

        <PlanEquipmentSection equipment={plan.available_equipment_snapshot} />

        {syncError ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive p-4 text-sm text-destructive"
          >
            <span>
              Nie udało się odświeżyć planu. Odśwież go przed kolejną zmianą.
            </span>
            <CustomizedButton
              type="button"
              className="w-auto"
              disabled={syncing}
              onClick={() => void refreshPlan()}
            >
              Odśwież plan
            </CustomizedButton>
          </div>
        ) : null}

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
                syncing ||
                syncError
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
            if (!open && !replace.isPending && !syncing) {
              setSelected(null);
              replace.reset();
            }
          }}
          onReplace={(exerciseId) => void handleReplace(exerciseId)}
          isReplacing={replace.isPending || syncing}
          replaceError={replace.error}
          refreshRequired={syncError}
          onRefreshPlan={() => void refreshSelectedPlan()}
        />

        <RegeneratePlanDialog
          plan={plan}
          open={regenerateOpen}
          onOpenChange={setRegenerateOpen}
          onStarted={(jobId) => navigate(`/plans/generation/${jobId}`)}
        />
      </div>
    </div>
  );
}
