import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { ExerciseAttributesSelector } from "@/components/exercise/ExerciseAttributesSelector";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInputWithController } from "@/components/shared/CustomizedInputWithController";
import { DualRangeField } from "@/components/shared/DualRangeField";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateExercise } from "@/hooks/exercises/useCreateExercise";
import { useUpdateExercise } from "@/hooks/exercises/useUpdateExercise";
import { toExerciseFormValues, toExerciseWrite } from "@/lib/mappers/exercise";
import {
  exerciseFormSchema,
  type ExerciseFormOutput,
  type ExerciseFormValues,
} from "@/lib/validation/exercise";
import type { Exercise } from "@/types/exercise";

type Props = { exercise?: Exercise | null; onClose: () => void };

export function ExerciseForm({ exercise, onClose }: Props) {
  const {
    createExercise,
    isCreating,
    error: createError,
  } = useCreateExercise();
  const {
    updateExercise,
    isUpdating,
    error: updateError,
  } = useUpdateExercise();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExerciseFormValues, unknown, ExerciseFormOutput>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: toExerciseFormValues(exercise),
  });
  const values = watch();
  const isSubmitting = isCreating || isUpdating;

  const submit: SubmitHandler<ExerciseFormOutput> = async (formValues) => {
    try {
      const payload = toExerciseWrite(formValues, exercise?.image_url ?? null);
      if (exercise) {
        await updateExercise({ id: exercise.id, payload });
        toast.success("Ćwiczenie zostało zaktualizowane");
      } else {
        await createExercise(payload);
        toast.success("Ćwiczenie zostało utworzone");
      }
      onClose();
    } catch {
      // Mutation hook exposes the user-facing error.
    }
  };

  return (
    <form
      className="flex h-full min-h-0 flex-col overflow-hidden"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <ScrollArea
        type="always"
        className="h-full min-h-0 flex-1 overflow-hidden px-1"
      >
        <div className="flex flex-col gap-4 pr-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-[1.35fr_1fr]">
            <CustomizedInputWithController
              control={control}
              name="name"
              label="Nazwa ćwiczenia"
              placeholder="np. Borek"
              disabled={isSubmitting}
            />
            <DualRangeField
              label="Wiek"
              min={1}
              max={Math.max(99, exercise?.max_age ?? 99)}
              value={[Number(values.minAge), Number(values.maxAge)]}
              onValueChange={([min, max]) => {
                setValue("minAge", String(min), { shouldValidate: true });
                setValue("maxAge", String(max), { shouldValidate: true });
              }}
              disabled={isSubmitting}
            />
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <label className="flex flex-col gap-1.5 text-sm">
                  Opis
                  <textarea
                    {...field}
                    disabled={isSubmitting}
                    placeholder="Opisz ćwiczenie, zasady, wariant..."
                    className="h-24 resize-none rounded-md border border-input bg-input/30 p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                  {fieldState.error?.message ? (
                    <InputErrorMessage message={fieldState.error.message} />
                  ) : null}
                </label>
              )}
            />
            <DualRangeField
              label="Liczba uczestników"
              min={1}
              max={Math.max(99, exercise?.max_participants ?? 99)}
              value={[
                Number(values.minParticipants),
                Number(values.maxParticipants),
              ]}
              onValueChange={([min, max]) => {
                setValue("minParticipants", String(min), {
                  shouldValidate: true,
                });
                setValue("maxParticipants", String(max), {
                  shouldValidate: true,
                });
              }}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <CustomizedInputWithController
              control={control}
              name="physicalDifficulty"
              label="Intensywność fizyczna"
              type="number"
              min="1"
              max="5"
              disabled={isSubmitting}
            />
            <CustomizedInputWithController
              control={control}
              name="technicalDifficulty"
              label="Trudność techniczna"
              type="number"
              min="1"
              max="5"
              disabled={isSubmitting}
            />
            <CustomizedInputWithController
              control={control}
              name="durationMinutes"
              label="Czas trwania w minutach"
              type="number"
              min="1"
              disabled={isSubmitting}
            />
            <CustomizedInputWithController
              control={control}
              name="upperBodyLoad"
              label="Zaangażowanie górnych partii"
              type="number"
              min="1"
              max="5"
              disabled={isSubmitting}
            />
            <CustomizedInputWithController
              control={control}
              name="lowerBodyLoad"
              label="Zaangażowanie dolnych partii"
              type="number"
              min="1"
              max="5"
              disabled={isSubmitting}
            />
            <CustomizedInputWithController
              control={control}
              name="coreLoad"
              label="Zaangażowanie partii core"
              type="number"
              min="1"
              max="5"
              disabled={isSubmitting}
            />
          </div>
          <ExerciseAttributesSelector
            equipmentIds={values.equipmentIds}
            typeIds={values.trainingTypeIds}
            segmentIds={values.segmentIds.map(Number)}
            onEquipmentIdsChange={(ids) => setValue("equipmentIds", ids)}
            onTypeIdsChange={(ids) =>
              setValue("trainingTypeIds", ids, { shouldValidate: true })
            }
            onSegmentIdsChange={(ids) =>
              setValue("segmentIds", ids.map(String), { shouldValidate: true })
            }
            errors={{
              type: errors.trainingTypeIds?.message,
              segment: errors.segmentIds?.message,
            }}
          />
          {createError || updateError ? (
            <InputErrorMessage message={createError ?? updateError ?? ""} />
          ) : null}
        </div>
      </ScrollArea>
      <div className="-mx-4 flex shrink-0 flex-col-reverse gap-3 border-t bg-background px-4 pt-4 pb-2 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
        <CustomizedButton
          type="button"
          variant="outline"
          className="w-full sm:w-32"
          onClick={onClose}
        >
          Anuluj
        </CustomizedButton>
        <CustomizedButton
          type="submit"
          variant="primary"
          className="w-full sm:w-54"
          disabled={isSubmitting}
        >
          {exercise ? "Edytuj ćwiczenie" : "Stwórz ćwiczenie"}
        </CustomizedButton>
      </div>
    </form>
  );
}
