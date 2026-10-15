import type { ComponentProps } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";

export type ControlledInputProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof CustomizedInput>,
  "name" | "value" | "onChange" | "onBlur" | "ref"
> & {
  name: FieldPath<TFieldValues>;
};

type CustomizedInputWithControllerProps<
  TFieldValues extends FieldValues,
  TTransformedValues,
> = ControlledInputProps<TFieldValues> & {
  control: Control<TFieldValues, unknown, TTransformedValues>;
  showError?: boolean;
};

export function CustomizedInputWithController<
  TFieldValues extends FieldValues,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  showError = true,
  ...inputProps
}: CustomizedInputWithControllerProps<TFieldValues, TTransformedValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <CustomizedInput
            {...inputProps}
            ref={field.ref}
            name={field.name}
            value={String(field.value ?? "")}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
          {showError && fieldState.error?.message ? (
            <InputErrorMessage message={fieldState.error.message} />
          ) : null}
        </div>
      )}
    />
  );
}
