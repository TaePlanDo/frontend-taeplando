import { cn } from "cn";

import type { PlanSchemaSnapshotItem } from "@/types/plan";

type ReadonlySchemaBarProps = {
  schema: PlanSchemaSnapshotItem[];
  className?: string;
};

const SEGMENT_COLORS = [
  "bg-plan-schema-peach",
  "bg-primary",
  "bg-plan-schema-brown",
  "bg-primary-foreground",
] as const;

export function ReadonlySchemaBar({
  schema,
  className,
}: ReadonlySchemaBarProps) {
  const items = [...schema].sort((a, b) => a.position - b.position);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={items
          .map((item) => `${item.name} ${Math.round(item.percentage)}%`)
          .join(", ")}
      >
        {items.map((item, index) => (
          <div
            key={`${item.position}-${item.segment_id}`}
            className={cn(
              "h-full",
              SEGMENT_COLORS[index % SEGMENT_COLORS.length],
            )}
            style={{ width: `${item.percentage}%` }}
            title={`${item.name}: ${Math.round(item.percentage)}%`}
          />
        ))}
      </div>

      <ul className="flex flex-nowrap items-center gap-x-3 overflow-hidden text-xs sm:gap-x-4 sm:text-sm">
        {items.map((item, index) => (
          <li
            key={`${item.position}-${item.segment_id}`}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-foreground"
          >
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                SEGMENT_COLORS[index % SEGMENT_COLORS.length],
              )}
              aria-hidden
            />
            <span>
              {item.name}{" "}
              <span className="text-muted-foreground">
                {Math.round(item.percentage)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
