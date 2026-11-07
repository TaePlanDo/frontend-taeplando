import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const { plan, isLoading, isError, refetch } = usePlan(planId);
  const { deletePlan } = useDeletePlan();
  const [regenerateOpen, setRegenerateOpen] = useState(false);

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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-6">
      <PlanDetailHeader
        plan={plan}
        onBack={() => navigate("/plans")}
        onRegenerate={() => setRegenerateOpen(true)}
        onDelete={async () => {
          await deletePlan(plan.id);
          navigate("/plans");
        }}
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
  );
}
