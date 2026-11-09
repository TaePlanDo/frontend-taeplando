import { useEffect, useState } from "react";

import { Slider } from "@/components/ui/slider";

type DualRangeFieldProps = {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onValueCommit: (value: [number, number]) => void;
  disabled?: boolean;
};

export function DualRangeField({
  label,
  min,
  max,
  value,
  onValueCommit,
  disabled,
}: DualRangeFieldProps) {
  const [low, high] = value;
  const [current, setCurrent] = useState<number[]>(value);

  useEffect(() => {
    setCurrent([low, high]);
  }, [low, high]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {current[0]} - {current[1]}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={current}
        disabled={disabled}
        onValueChange={setCurrent}
        onValueCommit={([newLow, newHigh]) => {
          if (newLow != null && newHigh != null) {
            onValueCommit([newLow, newHigh]);
          }
        }}
        aria-label={label}
      />
    </div>
  );
}
