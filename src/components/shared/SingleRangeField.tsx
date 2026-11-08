import { useId } from "react";
import { Slider } from "@/components/ui/slider";

import { InputErrorMessage } from "./InputErrorMessage";

type SingleRangeFieldProps = {
  label: string;
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  error?: string;
};

export function SingleRangeField({
  label,
  min,
  max,
  value,
  onValueChange,
  formatValue = String,
  disabled,
  error,
}: SingleRangeFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span
          id={`${id}-label`}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </span>
        <span className="text-sm font-medium text-primary">
          {formatValue(value)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={[value]}
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        aria-valuetext={formatValue(value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onValueChange={([next]) => {
          if (next != null) onValueChange(next);
        }}
      />
      <div
        className="flex justify-between text-xs text-muted-foreground"
        aria-hidden="true"
      >
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {error ? <InputErrorMessage id={`${id}-error`} message={error} /> : null}
    </div>
  );
}
