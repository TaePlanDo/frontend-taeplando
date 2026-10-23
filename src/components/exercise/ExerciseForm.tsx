import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { ExerciseAttributesSelector } from "@/components/exercise/ExerciseAttributesSelector";
import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { Input } from "@/components/ui/input";
import { useCreateExercise } from "@/hooks/exercises/useCreateExercise";
import { useUpdateExercise } from "@/hooks/exercises/useUpdateExercise";
import { toExerciseFormValues } from "@/lib/mappers/exercise";
import {
  validateExerciseSubmission,
  type ExerciseFieldErrors,
} from "@/lib/validation/exerciseSubmission";
import type { Exercise } from "@/types/exercise";

type Props = { exercise?: Exercise | null; onClose: () => void };

type NumberInputProps = {
  name: string;
  label: string;
  initialValue: number | null;
  placeholder?: string;
  min?: string;
};

function NumberInput({
  name,
  label,
  initialValue,
  placeholder,
  min = "1",
}: NumberInputProps) {
  const [value, setValue] = useState(
    initialValue === null ? "" : String(initialValue),
  );

  return (
    <CustomizedInput
      required
      min={min}
      name={name}
      label={label}
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onValueChange={setValue}
      className="h-10 rounded-md text-sm"
      classNameLabel="hidden"
    />
  );
}

export function ExerciseForm({ exercise, onClose }: Props) {
  const initialValues = toExerciseFormValues(exercise);
  const { createExercise, isCreating, error } = useCreateExercise();
  const {
    updateExercise,
    isUpdating,
    error: updateError,
  } = useUpdateExercise();
  const isEdit = exercise != null;
  const [equipmentIds, setEquipmentIds] = useState<string[]>(
    initialValues.equipmentIds,
  );
  const [typeIds, setTypeIds] = useState<string[]>(
    initialValues.trainingTypeIds,
  );
  const [segmentIds, setSegmentIds] = useState<number[]>(() =>
    initialValues.segmentIds.map(Number),
  );
  const [fieldErrors, setFieldErrors] = useState<ExerciseFieldErrors>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const { payload, errors } = validateExerciseSubmission(
      data,
      equipmentIds,
      typeIds,
      segmentIds,
    );
    if (!payload) {
      setFieldErrors(errors);
      return;
    }
    try {
      if (exercise) {
        await updateExercise({ id: exercise.id, payload });
        toast.success("Ćwiczenie zostało zaktualizowane");
      } else {
        await createExercise(payload);
        toast.success("Ćwiczenie zostało utworzone");
      }
      onClose();
    } catch {
      /* error from hook */
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
      <div className="grid gap-x-3 gap-y-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          Nazwa ćwiczenia
          <Input
            required
            name="name"
            placeholder="np. Borek"
            defaultValue={initialValues.name}
            disabled={isCreating || isUpdating}
            onChange={() =>
              setFieldErrors((errors) => ({ ...errors, name: undefined }))
            }
          />
          {fieldErrors.name ? (
            <InputErrorMessage message={fieldErrors.name} />
          ) : null}
        </label>
        <div className="flex flex-col gap-1.5 text-sm">
          Wiek (lata)
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="mb-1 block text-xs text-foreground/60">
                Minimalny wiek
              </span>
              <NumberInput
                name="min_age"
                label=""
                initialValue={
                  initialValues.minAge ? Number(initialValues.minAge) : null
                }
              />
            </div>
            <div>
              <span className="mb-1 block text-xs text-foreground/60">
                Maksymalny wiek
              </span>
              <NumberInput
                name="max_age"
                label=""
                initialValue={
                  initialValues.maxAge ? Number(initialValues.maxAge) : null
                }
              />
            </div>
          </div>
          {fieldErrors.age ? (
            <InputErrorMessage message={fieldErrors.age} />
          ) : null}
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          Opis
          <textarea
            required
            name="description"
            placeholder="Opisz ćwiczenie, zasady, wariant..."
            defaultValue={initialValues.description}
            onChange={() =>
              setFieldErrors((errors) => ({
                ...errors,
                description: undefined,
              }))
            }
            className="h-29 resize-none rounded-md border border-input bg-input/30 p-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          {fieldErrors.description ? (
            <InputErrorMessage message={fieldErrors.description} />
          ) : null}
        </label>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-sm">
            Liczba uczestników
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="mb-1 block text-xs text-foreground/60">
                  Minimalna liczba uczestników
                </span>
                <NumberInput
                  name="min_participants"
                  label=""
                  initialValue={
                    initialValues.minParticipants
                      ? Number(initialValues.minParticipants)
                      : null
                  }
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-foreground/60">
                  Maksymalna liczba uczestników
                </span>
                <NumberInput
                  name="max_participants"
                  label=""
                  initialValue={
                    initialValues.maxParticipants
                      ? Number(initialValues.maxParticipants)
                      : null
                  }
                />
              </div>
            </div>
            {fieldErrors.participants ? (
              <InputErrorMessage message={fieldErrors.participants} />
            ) : null}
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            Czas trwania w minutach
            <NumberInput
              name="duration_minutes"
              label=""
              initialValue={Number(initialValues.durationMinutes)}
              min="0"
            />
            {fieldErrors.duration ? (
              <InputErrorMessage message={fieldErrors.duration} />
            ) : null}
          </label>
        </div>
      </div>
      <ExerciseAttributesSelector
        equipmentIds={equipmentIds}
        typeIds={typeIds}
        segmentIds={segmentIds}
        onEquipmentIdsChange={setEquipmentIds}
        onTypeIdsChange={setTypeIds}
        onSegmentIdsChange={setSegmentIds}
        errors={{ type: fieldErrors.type, segment: fieldErrors.segment }}
        onClearError={(field) =>
          setFieldErrors((errors) => ({ ...errors, [field]: undefined }))
        }
      />
      {error || updateError ? (
        <p className="text-sm text-destructive">{error ?? updateError}</p>
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
          disabled={isCreating || isUpdating}
        >
          {isEdit ? "Edytuj ćwiczenie" : "Stwórz ćwiczenie"}
        </CustomizedButton>
      </div>
    </form>
  );
}
