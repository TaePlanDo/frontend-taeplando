import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInputWithController } from "@/components/shared/CustomizedInputWithController";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { useCreateEquipment } from "@/hooks/equipment/useCreateEquipment";
import { useUpdateEquipment } from "@/hooks/equipment/useUpdateEquipment";
import {
  equipmentFormSchema,
  type EquipmentFormOutput,
  type EquipmentFormValues,
} from "@/lib/validation/equipment";
import type { Equipment } from "@/types/equipment";

type EquipmentFormProps = {
  equipment?: Equipment | null;
  onClose: () => void;
};

export function EquipmentForm({ equipment, onClose }: EquipmentFormProps) {
  const isEdit = equipment != null;
  const {
    createEquipment,
    isCreating,
    error: createError,
  } = useCreateEquipment();
  const {
    updateEquipment,
    isUpdating,
    error: updateError,
  } = useUpdateEquipment();
  const { control, handleSubmit } = useForm<
    EquipmentFormValues,
    unknown,
    EquipmentFormOutput
  >({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: { name: equipment?.name ?? "" },
  });

  const isSubmitting = isCreating || isUpdating;
  const submitError = isEdit ? updateError : createError;

  const onSubmit: SubmitHandler<EquipmentFormOutput> = async ({ name }) => {
    try {
      if (isEdit) {
        await updateEquipment(equipment.id, { name });
        toast.success("Sprzęt został zaktualizowany");
      } else {
        await createEquipment({ name });
        toast.success("Sprzęt został utworzony");
      }
      onClose();
    } catch {
      // The mutation hook exposes the user-facing error.
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
        label="Nazwa"
        placeholder="Znaczniki"
        disabled={isSubmitting}
      />

      {submitError ? <InputErrorMessage message={submitError} /> : null}

      <CustomizedButton
        type="submit"
        variant="primary"
        className="mx-auto mt-8 w-full max-w-104"
        disabled={isSubmitting}
      >
        {isEdit ? "Edytuj sprzęt" : "Dodaj sprzęt"}
      </CustomizedButton>
    </form>
  );
}
