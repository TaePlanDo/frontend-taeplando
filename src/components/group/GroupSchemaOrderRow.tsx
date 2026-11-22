import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "cn";
import { GripVertical, Minus, Plus, Trash2 } from "lucide-react";

import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { GROUP_SCHEMA_LIMITS } from "@/lib/constants/group";
import type { SchemaDraftItem } from "@/lib/groups/schema-draft";

type GroupSchemaOrderRowProps = {
  item: SchemaDraftItem;
  canRemove: boolean;
  disabled?: boolean;
  onRemove: () => void;
  maxPercentage: number;
  onPercentageChange: (percentage: number) => void;
};

export function GroupSchemaOrderRow({
  item,
  canRemove,
  disabled = false,
  onRemove,
  maxPercentage,
  onPercentageChange,
}: GroupSchemaOrderRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.segmentCode, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex flex-col rounded-xl border border-border bg-background/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:rounded-md sm:border-transparent sm:bg-transparent sm:px-1 sm:py-1",
        isDragging &&
          "z-10 border-foreground/10 bg-background opacity-90 shadow-sm",
      )}
    >
      <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:contents">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className="flex h-7 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-foreground/50 hover:text-foreground disabled:cursor-not-allowed sm:h-4"
            aria-label={`Przenieś ${item.segmentName}`}
            disabled={disabled}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="min-w-0 text-lg font-medium text-foreground [overflow-wrap:anywhere] sm:truncate sm:text-sm sm:font-normal">
            {item.segmentName}{" "}
            <span className="whitespace-nowrap text-sm font-normal tabular-nums text-foreground/60">
              ({item.percentage}%)
            </span>
          </span>
        </div>
        {canRemove ? (
          <CardItemActionButton
            type="button"
            icon={<Trash2 className="h-4 w-4" />}
            className="text-primary hover:bg-primary/10 px-2 sm:order-3"
            aria-label={`Usuń ${item.segmentName}`}
            disabled={disabled}
            onClick={onRemove}
          />
        ) : null}
      </div>
      <div className="flex items-center gap-3 sm:order-2 sm:gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 sm:size-7"
          aria-label={`Zmniejsz udział: ${item.segmentName}`}
          disabled={
            disabled || item.percentage <= GROUP_SCHEMA_LIMITS.MIN_PERCENTAGE
          }
          onClick={() =>
            onPercentageChange(
              item.percentage - GROUP_SCHEMA_LIMITS.PERCENTAGE_STEP,
            )
          }
        >
          <Minus className="size-4" aria-hidden />
        </Button>
        <Slider
          className="h-9 sm:hidden [&_[data-slot=slider-track]]:h-2.5 [&_[data-slot=slider-range]]:bg-linear-to-r [&_[data-slot=slider-range]]:from-primary [&_[data-slot=slider-range]]:to-primary-foreground"
          aria-label={`Udział: ${item.segmentName}`}
          aria-valuetext={`${item.percentage}%`}
          min={GROUP_SCHEMA_LIMITS.MIN_PERCENTAGE}
          max={GROUP_SCHEMA_LIMITS.TOTAL_PERCENTAGE}
          step={GROUP_SCHEMA_LIMITS.PERCENTAGE_STEP}
          value={[item.percentage]}
          disabled={disabled}
          onValueChange={([percentage]) => {
            if (percentage != null) onPercentageChange(percentage);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 shrink-0 sm:size-7"
          aria-label={`Zwiększ udział: ${item.segmentName}`}
          disabled={disabled || item.percentage >= maxPercentage}
          onClick={() =>
            onPercentageChange(
              item.percentage + GROUP_SCHEMA_LIMITS.PERCENTAGE_STEP,
            )
          }
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
    </li>
  );
}
