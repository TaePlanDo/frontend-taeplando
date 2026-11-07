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
  const { groups, equipment, trainingTypes } = usePlanGenerationOptions();
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
  const loading =
    groups.isPending || equipment.isPending || trainingTypes.isPending;
  const failedQueries = [
    { query: groups, label: "grup treningowych" },
    { query: equipment, label: "sprzętu" },
    { query: trainingTypes, label: "typów treningu" },
  ].filter(({ query }) => query.isError);
  const noGroups = groups.isSuccess && groups.data.length === 0;
  const unavailable = loading || failedQueries.length > 0 || noGroups;

  async function submit(values: PlanGenerationFormOutput) {
    if (submitting.current || unavailable) return;
    reset();
    let invalid = false;
    if (!groups.data?.some(({ id }) => id === values.trainingGroupId)) {
      setError("trainingGroupId", {
        message: "Wybrana grupa jest niedostępna. Wybierz inną.",
      });
      invalid = true;
    }
    if (
      values.equipmentIds.some(
        (id) => !equipment.data?.some((item) => item.id === id),
      )
    ) {
      setError("equipmentIds", {
        message: "Wybrany sprzęt jest niedostępny. Usuń go z listy.",
      });
      invalid = true;
    }
    if (
      values.trainingTypeId !== null &&
      !trainingTypes.data?.some(({ id }) => id === values.trainingTypeId)
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
            placeholder={groups.isPending ? "Ładowanie…" : "Wybierz grupę…"}
            options={(groups.data ?? []).map(({ id, name }) => ({
              value: id,
              label: name,
            }))}
            value={field.value}
            onValueChange={field.onChange}
            disabled={busy || !groups.isSuccess || noGroups}
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
            items={equipment.data ?? []}
            selectedIds={field.value}
            onSelectedIdsChange={field.onChange}
            isLoading={equipment.isPending}
            disabled={busy || equipment.isError}
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
              ...(trainingTypes.data ?? []).map(({ id, name }) => ({
                value: id,
                label: name,
              })),
            ]}
            value={field.value ?? "auto"}
            onValueChange={(value) =>
              field.onChange(value === "auto" ? null : value)
            }
            disabled={busy || !trainingTypes.isSuccess}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="mt-2 flex flex-col items-center gap-3">
        <CustomizedButton
          type="submit"
          variant="hero"
          className="h-auto w-full py-4 text-3xl lg:w-auto lg:min-w-70 lg:px-10"
          disabled={busy || unavailable}
        >
          {busy ? "Rozpoczynanie…" : "Generuj plan"}
        </CustomizedButton>
        {error ? <InputErrorMessage message={error} /> : null}
        {failedQueries.length > 0 ? (
          <div className="text-center text-sm text-destructive">
            <InputErrorMessage
              message={`Nie udało się pobrać ${failedQueries.map(({ label }) => label).join(", ")}.`}
            />
            <button
              type="button"
              className="mt-1 underline disabled:opacity-50"
              disabled={failedQueries.some(({ query }) => query.isFetching)}
              onClick={() => {
                void Promise.all(
                  failedQueries.map(({ query }) => query.refetch()),
                );
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
