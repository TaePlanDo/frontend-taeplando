import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { useIsMobile } from "@/hooks/useIsMobile";

import { CustomizedInputWithController } from "./CustomizedInputWithController";
import { NumberCarouselField } from "./NumberCarouselField";

type Props<TValues extends FieldValues, TOutput> = {
  control: Control<TValues, unknown, TOutput>;
  name: FieldPath<TValues>;
  label: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
};

export function DurationField<TValues extends FieldValues, TOutput = TValues>({
  control,
  name,
  ...props
}: Props<TValues, TOutput>) {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return (
      <CustomizedInputWithController
        {...props}
        control={control}
        name={name}
        type="number"
      />
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <NumberCarouselField
          {...props}
          value={Number(field.value)}
          onValueChange={(value) => field.onChange(String(value))}
          onBlur={field.onBlur}
          fieldRef={field.ref}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
