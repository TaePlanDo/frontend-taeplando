import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PlanDetailHeader } from "@/components/plan/PlanDetailHeader";
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
import { groupPlanPhases } from "@/lib/plan/phaseGrouping";

export function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const backTo: string = useLocation().state?.backTo ?? "/plans";
  const { plan, isLoading, isError, refetch } = usePlan(planId);
  const { deletePlan } = useDeletePlan();
  const [regenerateOpen, setRegenerateOpen] = useState(false);

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

  if (isError || !plan) {
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
    <div className="flex flex-1 justify-center p-6">
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
            <PlanPhaseSection key={phase.schema.position} phase={phase} />
          ))}
        </div>

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
