import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { CatalogMultiSelect } from "@/components/shared/CatalogMultiSelect";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSelect } from "@/components/shared/CustomizedSelect";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { SingleRangeField } from "@/components/shared/SingleRangeField";
import { usePlanGenerationOptions } from "@/hooks/plans/usePlanGenerationOptions";
import { useStartPlanGeneration } from "@/hooks/plans/useStartPlanGeneration";
import { PLAN_GENERATION_LIMITS } from "@/lib/constants/planGeneration";
import { formatParticipantCount } from "@/lib/format/plural";
import {
  toPlanGenerationFormValues,
  toPlanGenerationParameters,
} from "@/lib/mappers/planGeneration";
import {
  planGenerationSchema,
  type PlanGenerationFormValues,
  type PlanGenerationFormOutput,
} from "@/lib/validation/planGeneration";

export function PlanGenerationForm({
  onStarted,
}: {
  onStarted: (jobId: string) => void;
}) {
  const {
    groups,
    equipment,
    trainingTypes,
    state: optionsState,
    retry,
  } = usePlanGenerationOptions();
  const { startPlanGeneration, isStarting, error, reset } =
    useStartPlanGeneration();
  const submitting = useRef(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<PlanGenerationFormValues, unknown, PlanGenerationFormOutput>({
    resolver: zodResolver(planGenerationSchema),
    defaultValues: toPlanGenerationFormValues(),
  });
  const busy = isStarting || isSubmitting;
  const noGroups = groups.status === "ready" && groups.items.length === 0;

  async function submit(values: PlanGenerationFormOutput) {
    if (submitting.current || optionsState.kind !== "ready") return;
    reset();
    let invalid = false;
    if (!groups.items.some(({ id }) => id === values.trainingGroupId)) {
      setError("trainingGroupId", {
        message: "Wybrana grupa jest niedostępna. Wybierz inną.",
      });
      invalid = true;
    }
    if (
      values.equipmentIds.some(
        (id) => !equipment.items.some((item) => item.id === id),
      )
    ) {
      setError("equipmentIds", {
        message: "Wybrany sprzęt jest niedostępny. Usuń go z listy.",
      });
      invalid = true;
    }
    if (
      values.trainingTypeId !== null &&
      !trainingTypes.items.some(({ id }) => id === values.trainingTypeId)
    ) {
      setError("trainingTypeId", {
        message: "Wybrany typ jest niedostępny. Wybierz inny lub Auto.",
      });
      invalid = true;
    }
    if (invalid) return;
    submitting.current = true;
    try {
      const accepted = await startPlanGeneration(
        toPlanGenerationParameters(values),
      );
      onStarted(accepted.id);
    } catch {
      // The mutation hook exposes the message next to the submit button.
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form
      className="mt-8 flex flex-col gap-6"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <Controller
        control={control}
        name="trainingGroupId"
        render={({ field, fieldState }) => (
          <CustomizedSelect
            label="Grupa treningowa"
            placeholder={
              groups.status === "offline"
                ? "Brak połączenia"
                : groups.status === "loading"
                  ? "Ładowanie…"
                  : "Wybierz grupę…"
            }
            options={groups.items.map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            value={field.value}
            onValueChange={field.onChange}
            disabled={busy || groups.status !== "ready" || noGroups}
            error={fieldState.error?.message}
          />
        )}
      />
      {noGroups ? (
        <p className="-mt-3 text-sm text-muted-foreground">
          Nie masz jeszcze grupy treningowej.{" "}
          <Link className="text-primary underline" to="/groups">
            Utwórz grupę
          </Link>
          , aby wygenerować plan.
        </p>
      ) : null}
      <Controller
        control={control}
        name="participantCount"
        render={({ field, fieldState }) => (
          <SingleRangeField
            label="Liczba uczestników"
            min={PLAN_GENERATION_LIMITS.MIN_PARTICIPANTS}
            max={PLAN_GENERATION_LIMITS.MAX_PARTICIPANTS}
            value={field.value}
            onValueChange={field.onChange}
            formatValue={formatParticipantCount}
            disabled={busy}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="equipmentIds"
        render={({ field, fieldState }) => (
          <CatalogMultiSelect
            label="Sprzęt treningowy"
            placeholder="Wybierz sprzęt…"
            items={equipment.items}
            selectedIds={field.value}
            onSelectedIdsChange={field.onChange}
            isLoading={equipment.status === "loading"}
            unavailableMessage={
              equipment.status === "offline" ? "Brak połączenia" : undefined
            }
            disabled={busy || equipment.status === "error"}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="trainingTypeId"
        render={({ field, fieldState }) => (
          <CustomizedSelect
            label="Typ treningu"
            options={[
              { value: "auto", label: "Auto" },
              ...trainingTypes.items.map(({ id, name }) => ({
                value: id,
                label: name,
              })),
            ]}
            value={field.value ?? "auto"}
            onValueChange={(value) =>
              field.onChange(value === "auto" ? null : value)
            }
            disabled={busy || trainingTypes.status !== "ready"}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="mt-2 flex flex-col items-center gap-3">
        <CustomizedButton
          type="submit"
          variant="hero"
          className="h-auto w-full py-4 text-3xl lg:w-auto lg:min-w-70 lg:px-10"
          disabled={busy || optionsState.kind !== "ready"}
        >
          {busy ? "Rozpoczynanie…" : "Generuj plan"}
        </CustomizedButton>
        {error ? <InputErrorMessage message={error} /> : null}
        {optionsState.kind === "offline" || optionsState.kind === "error" ? (
          <div className="text-center text-sm text-destructive">
            <InputErrorMessage message={optionsState.message} />
            <button
              type="button"
              className="mt-1 underline disabled:opacity-50"
              disabled={
                optionsState.kind === "offline" || optionsState.retrying
              }
              onClick={() => {
                void retry();
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : null}
      </div>
    </form>
  );
}
