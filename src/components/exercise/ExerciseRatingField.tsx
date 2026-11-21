import { useId } from "react";
import { Controller, type Control } from "react-hook-form";

import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import type {
  ExerciseFormOutput,
  ExerciseFormValues,
} from "@/lib/validation/exercise";
import { PLANNING_FILTER_BOUNDS } from "@/types/exercise-list-filters";

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

const ratingOptions = Array.from(
  { length: PLANNING_FILTER_BOUNDS.max - PLANNING_FILTER_BOUNDS.min + 1 },
  (_, index) => String(PLANNING_FILTER_BOUNDS.min + index),
);

export function ExerciseRatingField({
  control,
  name,
  label,
  lowLabel,
  highLabel,
  disabled,
}: Props) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintsId = `${id}-hints`;
  const errorId = `${id}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <fieldset
          role="radiogroup"
          aria-labelledby={labelId}
          aria-describedby={`${hintsId}${fieldState.error ? ` ${errorId}` : ""}`}
          aria-invalid={Boolean(fieldState.error)}
          disabled={disabled}
          className="min-w-0"
        >
          <legend
            id={labelId}
            className="mb-2 text-sm font-medium text-foreground"
          >
            {label}
          </legend>
          <div className="grid grid-cols-5 gap-1">
            {ratingOptions.map((rating, index) => (
              <label key={rating} className="min-w-0 cursor-pointer">
                <input
                  ref={index === 0 ? field.ref : undefined}
                  type="radio"
                  name={field.name}
                  value={rating}
                  checked={field.value === rating}
                  onChange={() => field.onChange(rating)}
                  onBlur={field.onBlur}
                  aria-invalid={Boolean(fieldState.error)}
                  aria-describedby={fieldState.error ? errorId : undefined}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-input bg-background/40 text-sm font-medium text-foreground transition-colors peer-checked:border-primary peer-checked:bg-linear-to-r peer-checked:from-primary peer-checked:to-primary-foreground peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  {rating}
                </span>
              </label>
            ))}
          </div>
          <div
            id={hintsId}
            className="mt-1 flex justify-between gap-2 text-xs text-muted-foreground"
          >
            <span>{lowLabel}</span>
            <span>{highLabel}</span>
          </div>
          {fieldState.error?.message ? (
            <InputErrorMessage
              id={errorId}
              message={fieldState.error.message}
              className="mt-1.5"
            />
          ) : null}
        </fieldset>
      )}
    />
  );
}
