import { Slider } from "@/components/ui/slider";

type DualRangeFieldProps = {
  label: string;
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  disabled?: boolean;
};

export function DualRangeField({
  label,
  min,
  max,
  value,
  onValueChange,
  disabled,
}: DualRangeFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {value[0]} – {value[1]}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          const [low, high] = next;
          if (low == null || high == null) return;
          onValueChange([low, high]);
        }}
        aria-label={label}
      />
    </div>
  );
}
