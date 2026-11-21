import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInputWithController } from "@/components/shared/CustomizedInputWithController";
import { CustomizedPairInputWithControllers } from "@/components/shared/CustomizedPairInputWithControllers";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { DualRangeField } from "@/components/shared/DualRangeField";
import { NumberCarouselField } from "@/components/shared/NumberCarouselField";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCreateGroup } from "@/hooks/groups/useCreateGroup";
import { useUpdateGroup } from "@/hooks/groups/useUpdateGroup";
import { GROUP_LIMITS } from "@/lib/constants/group";
import { toFormValues, toGroupWrite } from "@/lib/mappers/group";
import {
  groupDetailsSchema,
  type GroupDetailsFormValues,
  type GroupDetailsOutput,
} from "@/lib/validation/group";
import type { Group } from "@/types/group";

type GroupDetailsFormProps = {
  group?: Group | null;
  onClose: () => void;
};

export function GroupDetailsForm({ group, onClose }: GroupDetailsFormProps) {
  const isEdit = group != null;
  const { createGroup, isCreating, error: createError } = useCreateGroup();
  const { updateGroup, isUpdating, error: updateError } = useUpdateGroup();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupDetailsFormValues, unknown, GroupDetailsOutput>({
    resolver: zodResolver(groupDetailsSchema),
    defaultValues: toFormValues(group),
  });

  const isSubmitting = isCreating || isUpdating;
  const isMobile = useIsMobile();
  const values = watch();
  const ageError = errors.minAge?.message ?? errors.maxAge?.message;
  const submitError = isEdit ? updateError : createError;

  const onSubmit: SubmitHandler<GroupDetailsOutput> = async (values) => {
    const payload = toGroupWrite(values);

    try {
      if (isEdit) {
        await updateGroup(group.id, payload);
        toast.success("Grupa została zaktualizowana");
      } else {
        await createGroup(payload);
        toast.success("Grupa została utworzona");
      }
      onClose();
    } catch {
      // Handle error through createError / updateError
    }
  };

  return (
    <form
      className="flex min-w-0 flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <CustomizedInputWithController
        control={control}
        name="name"
        label="Nazwa Grupy"
        classNameLabel="py-2 text-2xl"
        placeholder="Grupa wakacyjna"
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-1.5">
        <DualRangeField
          label="Wiek"
          min={GROUP_LIMITS.MIN_AGE}
          max={GROUP_LIMITS.MAX_AGE}
          value={[Number(values.minAge), Number(values.maxAge)]}
          onValueChange={([min, max]) => {
            setValue("minAge", String(min), { shouldValidate: true });
            setValue("maxAge", String(max), { shouldValidate: true });
          }}
          disabled={isSubmitting}
        />
        {ageError ? <InputErrorMessage message={ageError} /> : null}
      </div>

      {isMobile ? (
        <fieldset className="min-w-0 space-y-3" disabled={isSubmitting}>
          <legend className="text-base">Czas trwania</legend>
          {(
            [
              { name: "hours", label: "Godziny", max: GROUP_LIMITS.MAX_HOURS },
              {
                name: "minutes",
                label: "Minuty",
                max: GROUP_LIMITS.MAX_MINUTES,
              },
            ] as const
          ).map(({ name, label, max }) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field, fieldState }) => (
                <NumberCarouselField
                  label={label}
                  name={field.name}
                  min={0}
                  max={max}
                  value={Number(field.value)}
                  onValueChange={(value) => field.onChange(String(value))}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  disabled={isSubmitting}
                  error={fieldState.error?.message}
                />
              )}
            />
          ))}
        </fieldset>
      ) : (
        <CustomizedPairInputWithControllers
          title="Czas trwania"
          control={control}
          disabled={isSubmitting}
          first={{
            name: "hours",
            label: "Godziny",
            type: "number",
            min: 0,
            max: GROUP_LIMITS.MAX_HOURS,
          }}
          second={{
            name: "minutes",
            label: "Minuty",
            type: "number",
            min: 0,
            max: GROUP_LIMITS.MAX_MINUTES,
          }}
        />
      )}

      {submitError ? (
        <InputErrorMessage message={submitError} className="mx-2" />
      ) : null}

      <CustomizedButton
        type="submit"
        variant="primary"
        className="mx-auto mt-4 w-2/3"
        disabled={isSubmitting}
      >
        {isEdit ? "Zapisz zmiany" : "Utwórz"}
      </CustomizedButton>
    </form>
  );
}
