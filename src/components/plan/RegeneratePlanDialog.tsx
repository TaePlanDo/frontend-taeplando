import { useState } from "react";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { useStartPlanGeneration } from "@/hooks/plans/useStartPlanGeneration";
import { buildGenerationParametersFromPlan } from "@/lib/plan/buildGenerationParameters";
import type { PlanDetail } from "@/types/plan";

type RegeneratePlanDialogProps = {
  plan: PlanDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStarted: (jobId: string) => void;
};

export function RegeneratePlanDialog({
  plan,
  open,
  onOpenChange,
  onStarted,
}: RegeneratePlanDialogProps) {
  const [participantCount, setParticipantCount] = useState(
    String(plan.participant_count),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const { startPlanGeneration, isStarting, error, reset } =
    useStartPlanGeneration();

  function handleOpenChange(nextOpen: boolean) {
    reset();
    if (nextOpen) {
      setParticipantCount(String(plan.participant_count));
      setValidationError(null);
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirm() {
    const parsed = Number(participantCount);
    if (!Number.isInteger(parsed) || parsed < 1) {
      setValidationError("Podaj liczbę uczestników większą od 0");
      return;
    }

    setValidationError(null);
    try {
      const accepted = await startPlanGeneration(
        buildGenerationParametersFromPlan(plan, parsed),
      );
      handleOpenChange(false);
      onStarted(accepted.id);
    } catch {
      // mutation error shown via InputErrorMessage
    }
  }

  const displayError = validationError ?? error;

  return (
    <CustomizedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Potwierdź liczebność grupy"
      description="Możesz zostawić dotychczasową liczbę lub zmienić ją przed ponownym wygenerowaniem planu."
    >
      <div className="flex flex-col gap-4 pt-2">
        <CustomizedInput
          label="Liczba uczestników"
          type="number"
          min={1}
          step={1}
          name="participant_count"
          value={participantCount}
          onChange={(event) => setParticipantCount(event.target.value)}
          onValueChange={setParticipantCount}
          disabled={isStarting}
        />
        {displayError ? <InputErrorMessage message={displayError} /> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <CustomizedButton
            variant="outline"
            className="w-full sm:w-auto px-6"
            onClick={() => handleOpenChange(false)}
            disabled={isStarting}
          >
            Anuluj
          </CustomizedButton>
          <CustomizedButton
            variant="primary"
            className="w-full rounded-full sm:w-auto px-6"
            onClick={() => void handleConfirm()}
            disabled={isStarting}
          >
            {isStarting ? "Generowanie…" : "Generuj"}
          </CustomizedButton>
        </div>
      </div>
    </CustomizedDialog>
  );
}
