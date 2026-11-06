import type {
  PlanGenerationJobStatus,
  PlanGenerationStatus,
} from "@/types/plan";

export type GenerationView =
  | { kind: "loading" }
  | { kind: "error"; title?: string; message: string }
  | { kind: "ready"; planId: string };

const DEFAULT_FAILURE_MESSAGE =
  "Wystąpił nieoczekiwany błąd podczas generowania planu.";

const STATUS_FETCH_ERROR_MESSAGE =
  "Nie udało się pobrać statusu generowania planu.";

const MISSING_PLAN_ID_MESSAGE =
  "Plan został wygenerowany, ale brakuje identyfikatora planu.";

export function isPlanGenerationInProgress(
  status: PlanGenerationJobStatus | undefined,
): boolean {
  return status === "QUEUED" || status === "RUNNING";
}

export function deriveGenerationView(
  job: PlanGenerationStatus | null,
  isLoading: boolean,
  isError: boolean,
): GenerationView {
  if (isLoading) {
    return { kind: "loading" };
  }

  if (isError || !job) {
    return { kind: "error", message: STATUS_FETCH_ERROR_MESSAGE };
  }

  if (isPlanGenerationInProgress(job.status)) {
    return { kind: "loading" };
  }

  if (job.status === "FAILED" || job.status === "TIMED_OUT") {
    return {
      kind: "error",
      title: "Generowanie nie powiodło się",
      message: job.error_message ?? DEFAULT_FAILURE_MESSAGE,
    };
  }

  if (job.status === "SUCCEEDED") {
    if (!job.plan_id) {
      return {
        kind: "error",
        title: "Generowanie nie powiodło się",
        message: MISSING_PLAN_ID_MESSAGE,
      };
    }
    return { kind: "ready", planId: job.plan_id };
  }

  return { kind: "error", message: STATUS_FETCH_ERROR_MESSAGE };
}
