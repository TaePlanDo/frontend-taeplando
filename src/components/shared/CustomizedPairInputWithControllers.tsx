import {
  get,
  useFormState,
  type Control,
  type FieldValues,
} from "react-hook-form";

import {
  CustomizedInputWithController,
  type ControlledInputProps,
} from "@/components/shared/CustomizedInputWithController";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";

type CustomizedPairInputWithControllersProps<
  TFieldValues extends FieldValues,
  TTransformedValues,
> = {
  title: string;
  control: Control<TFieldValues, unknown, TTransformedValues>;
  first: ControlledInputProps<TFieldValues>;
  second: ControlledInputProps<TFieldValues>;
  disabled?: boolean;
};

export function CustomizedPairInputWithControllers<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  title,
  control,
  first,
  second,
  disabled,
}: CustomizedPairInputWithControllersProps<TFieldValues, TTransformedValues>) {
  const { errors } = useFormState({
    control,
    name: [first.name, second.name],
  });

  const error: string | undefined =
    get(errors, first.name)?.message ?? get(errors, second.name)?.message;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="py-2 text-2xl">{title}</span>
      <div className="grid grid-cols-2 gap-4">
        <CustomizedInputWithController
          control={control}
          disabled={disabled}
          showError={false}
          {...first}
        />
        <CustomizedInputWithController
          control={control}
          disabled={disabled}
          showError={false}
          {...second}
        />
      </div>
      {error ? <InputErrorMessage message={error} /> : null}
    </div>
  );
}
