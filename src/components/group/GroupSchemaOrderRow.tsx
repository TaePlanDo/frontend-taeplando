import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import type { SchemaDraftItem } from "@/lib/schema/schema-draft";

type GroupSchemaOrderRowProps = {
  item: SchemaDraftItem;
  canRemove: boolean;
  disabled?: boolean;
  onRemove: () => void;
};

export function GroupSchemaOrderRow({
  item,
  canRemove,
  disabled = false,
  onRemove,
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
      className={`flex items-center justify-between gap-2 rounded-md border border-transparent px-1 py-1 text-sm ${
        isDragging
          ? "z-10 border-foreground/10 bg-background opacity-90 shadow-sm"
          : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-foreground/50 hover:text-foreground disabled:cursor-not-allowed"
          aria-label={`Przenieś ${item.segmentName}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="truncate text-foreground">
          {item.segmentName}{" "}
          <span className="tabular-nums text-foreground/60">
            ({item.percentage}%)
          </span>
        </span>
      </div>
      {canRemove ? (
        <CardItemActionButton
          type="button"
          icon={<Trash2 className="h-4 w-4" />}
          className="text-primary hover:bg-primary/10 px-2"
          aria-label={`Usuń ${item.segmentName}`}
          disabled={disabled}
          onClick={onRemove}
        />
      ) : null}
    </li>
  );
}
