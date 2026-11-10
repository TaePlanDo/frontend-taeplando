import { useEffect, useState } from "react";

import { Slider } from "@/components/ui/slider";

type RangeHandler = (value: [number, number]) => void;

type DualRangeFieldProps = {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onValueChange?: RangeHandler;
  onValueCommit?: RangeHandler;
  disabled?: boolean;
};

function pairHandler(handler?: RangeHandler) {
  return ([low, high]: number[]) => {
    if (low != null && high != null) handler?.([low, high]);
  };
}

export function DualRangeField({
  label,
  min,
  max,
  value,
  onValueChange,
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
          {current[0]} – {current[1]}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={current}
        disabled={disabled}
        onValueChange={(next) => {
          setCurrent(next);
          pairHandler(onValueChange)(next);
        }}
        onValueCommit={pairHandler(onValueCommit)}
        aria-label={label}
      />
    </div>
  );
}
