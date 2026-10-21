import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInputWithController } from "@/components/shared/CustomizedInputWithController";
import { CustomizedPairInputWithControllers } from "@/components/shared/CustomizedPairInputWithControllers";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
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

  const { control, handleSubmit } = useForm<
    GroupDetailsFormValues,
    unknown,
    GroupDetailsOutput
  >({
    resolver: zodResolver(groupDetailsSchema),
    defaultValues: toFormValues(group),
  });

  const isSubmitting = isCreating || isUpdating;
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
      className="flex flex-col gap-4"
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

      <CustomizedPairInputWithControllers
        title="Wiek"
        control={control}
        disabled={isSubmitting}
        first={{
          name: "minAge",
          label: "Minimalny",
          type: "number",
          min: GROUP_LIMITS.MIN_AGE,
          max: GROUP_LIMITS.MAX_AGE,
        }}
        second={{
          name: "maxAge",
          label: "Maksymalny",
          type: "number",
          min: GROUP_LIMITS.MIN_AGE,
          max: GROUP_LIMITS.MAX_AGE,
        }}
      />

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
          max: 59,
        }}
      />

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
