import { Controller, type Control } from "react-hook-form";

import { NumberScaleField } from "@/components/shared/NumberScaleField";
import { CustomizedInputWithController } from "@/components/shared/CustomizedInputWithController";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NUMBER_SCALE_BOUNDS } from "@/lib/constants/numberScale";
import type {
  ExerciseFormOutput,
  ExerciseFormValues,
} from "@/lib/validation/exercise";

type RatingFieldName = keyof Pick<
  ExerciseFormValues,
  | "physicalDifficulty"
  | "technicalDifficulty"
  | "upperBodyLoad"
  | "lowerBodyLoad"
  | "coreLoad"
>;

type Props = {
  control: Control<ExerciseFormValues, unknown, ExerciseFormOutput>;
  name: RatingFieldName;
  label: string;
  lowLabel: string;
  highLabel: string;
  disabled?: boolean;
};

export function ExerciseRatingField({ control, name, ...props }: Props) {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return (
      <CustomizedInputWithController
        control={control}
        name={name}
        label={props.label}
        disabled={props.disabled}
        type="number"
        min={NUMBER_SCALE_BOUNDS.min}
        max={NUMBER_SCALE_BOUNDS.max}
      />
    );
  }
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <NumberScaleField
          {...props}
          name={field.name}
          value={Number(field.value)}
          onValueChange={(value) => field.onChange(String(value))}
          onBlur={field.onBlur}
          inputRef={field.ref}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
