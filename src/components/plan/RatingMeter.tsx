import { cn } from "cn";

import { PLAN_RATING_MAX } from "./planRatings";

type RatingMeterProps = {
  label: string;
  value: number;
  max?: number;
  fillClass?: string;
  showLabel?: boolean;
  className?: string;
};

export function RatingMeter({
  label,
  value,
  max = PLAN_RATING_MAX,
  fillClass = "bg-primary",
  showLabel = true,
  className,
}: RatingMeterProps) {
  const clamped = Math.min(Math.max(value, 0), max);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1",
        showLabel ? "min-w-[4.5rem]" : "items-center justify-center",
        className,
      )}
    >
      {showLabel ? (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{label}</span>
          <span className="tabular-nums text-foreground">
            {clamped}/{max}
          </span>
        </div>
      ) : null}
      <div
        className="flex w-full gap-0.5"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
      >
        {Array.from({ length: max }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-sm",
              index < clamped ? fillClass : "bg-muted",
            )}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
