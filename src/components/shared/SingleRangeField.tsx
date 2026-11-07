import { useId } from "react";
import { Slider as SliderPrimitive } from "radix-ui";

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
      <SliderPrimitive.Root
        min={min}
        max={max}
        step={1}
        value={[value]}
        disabled={disabled}
        className="relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50"
        onValueChange={([next]) => {
          if (next != null) onValueChange(next);
        }}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-labelledby={`${id}-label`}
          aria-valuetext={formatValue(value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
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
