import { Navigate, useParams } from "react-router-dom";

import {
  CenteredLoading,
  CenteredStatus,
} from "@/components/shared/CenteredStatus";
import { HomeLink } from "@/components/shared/HomeLink";
import { usePlanGenerationStatus } from "@/hooks/plans/usePlanGenerationStatus";
import { deriveGenerationView } from "@/lib/plan/generationView";

export function PlanGenerationPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { job, isLoading, isError } = usePlanGenerationStatus(jobId);
  const view = deriveGenerationView(job, isLoading, isError);

  switch (view.kind) {
    case "loading":
      return <CenteredLoading label="Generowanie planu…" />;
    case "ready":
      return <Navigate to={`/plans/${view.planId}`} replace />;
    case "error":
      return (
        <CenteredStatus
          title={view.title}
          message={view.message}
          actions={<HomeLink />}
        />
      );
  }
}
