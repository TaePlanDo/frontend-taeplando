import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { ExerciseAttributesSelector } from "@/components/exercise/ExerciseAttributesSelector";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInputWithController } from "@/components/shared/CustomizedInputWithController";
import { CustomizedPairInputWithControllers } from "@/components/shared/CustomizedPairInputWithControllers";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
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
      const payload = toExerciseWrite(formValues);
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
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="grid gap-x-3 gap-y-3 sm:grid-cols-2">
        <CustomizedInputWithController
          control={control}
          name="name"
          label="Nazwa ćwiczenia"
          placeholder="np. Borek"
          disabled={isSubmitting}
        />
        <CustomizedPairInputWithControllers
          control={control}
          title="Wiek (lata)"
          first={{
            name: "minAge",
            label: "Minimalny wiek",
            type: "number",
            min: 1,
          }}
          second={{
            name: "maxAge",
            label: "Maksymalny wiek",
            type: "number",
            min: 1,
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
        <div className="flex flex-col gap-3">
          <CustomizedPairInputWithControllers
            control={control}
            title="Liczba uczestników"
            first={{
              name: "minParticipants",
              label: "Minimalna liczba uczestników",
              type: "number",
              min: 1,
            }}
            second={{
              name: "maxParticipants",
              label: "Maksymalna liczba uczestników",
              type: "number",
              min: 1,
            }}
            disabled={isSubmitting}
          />
          <CustomizedInputWithController
            control={control}
            name="durationMinutes"
            label="Czas trwania w minutach"
            type="number"
            min="0"
            disabled={isSubmitting}
          />
        </div>
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
      <div className="-mx-6 -mb-6 flex justify-end gap-3 border-t px-6 py-4">
        <CustomizedButton
          type="button"
          variant="outline"
          className="w-32"
          onClick={onClose}
        >
          Anuluj
        </CustomizedButton>
        <CustomizedButton
          type="submit"
          variant="primary"
          className="w-54"
          disabled={isSubmitting}
        >
          {exercise ? "Edytuj ćwiczenie" : "Stwórz ćwiczenie"}
        </CustomizedButton>
      </div>
    </form>
  );
}
