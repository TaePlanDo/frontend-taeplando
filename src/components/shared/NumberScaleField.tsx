import { useId, type Ref } from "react";

import { NUMBER_SCALE_BOUNDS } from "@/lib/constants/numberScale";

import { InputErrorMessage } from "./InputErrorMessage";

type Props = {
  label: string;
  name?: string;
  value: number;
  onValueChange: (value: number) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  lowLabel?: string;
  highLabel?: string;
  disabled?: boolean;
  error?: string;
  minimum?: number;
  maximum?: number;
  formatValue?: (value: number) => string;
};

const options = Array.from(
  { length: NUMBER_SCALE_BOUNDS.max - NUMBER_SCALE_BOUNDS.min + 1 },
  (_, index) => NUMBER_SCALE_BOUNDS.min + index,
);

export function NumberScaleField({
  label,
  name,
  value,
  onValueChange,
  onBlur,
  inputRef,
  lowLabel,
  highLabel,
  disabled,
  error,
  minimum = NUMBER_SCALE_BOUNDS.min,
  maximum = NUMBER_SCALE_BOUNDS.max,
  formatValue = String,
}: Props) {
  const id = useId();
  const hasHints = Boolean(lowLabel || highLabel);
  const description =
    [hasHints ? `${id}-hints` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      aria-describedby={description}
      aria-invalid={Boolean(error)}
      disabled={disabled}
      className="min-w-0"
    >
      <legend
        id={`${id}-label`}
        className="mb-2 text-sm font-medium text-foreground"
      >
        {label}
      </legend>
      <div className="grid grid-cols-5 gap-1">
        {options.map((option, index) => (
          <label key={option} className="relative min-w-0 cursor-pointer">
            <input
              ref={index === 0 ? inputRef : undefined}
              type="radio"
              name={name ?? id}
              value={option}
              checked={value === option}
              onChange={() => onValueChange(option)}
              onBlur={onBlur}
              disabled={option < minimum || option > maximum}
              aria-invalid={Boolean(error)}
              aria-describedby={description}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-input bg-background/40 text-sm font-medium text-foreground transition-colors peer-checked:border-primary peer-checked:bg-linear-to-r peer-checked:from-primary peer-checked:to-primary-foreground peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              {formatValue(option)}
            </span>
          </label>
        ))}
      </div>
      {hasHints ? (
        <div
          id={`${id}-hints`}
          className="mt-1 flex justify-between gap-2 text-xs text-muted-foreground"
        >
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      ) : null}
      {error ? (
        <InputErrorMessage
          id={`${id}-error`}
          message={error}
          className="mt-1.5"
        />
      ) : null}
    </fieldset>
  );
}
