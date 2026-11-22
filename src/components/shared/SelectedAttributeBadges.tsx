import { X } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";

type AttributeItem<TId extends string | number> = {
  id: TId;
  name: string;
};

type Props<TId extends string | number> = {
  items: AttributeItem<TId>[];
  onRemove: (id: TId) => void;
  disabled?: boolean;
  className?: string;
};

export function SelectedAttributeBadges<TId extends string | number>({
  items,
  onRemove,
  disabled,
  className,
}: Props<TId>) {
  if (!items.length) return null;

  return (
    <div className={cn("mt-3 flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <Badge
          key={item.id}
          variant="secondaryOutline"
          className="max-w-full gap-1.5 whitespace-normal px-2.5 py-1"
        >
          <span className="min-w-0 [overflow-wrap:anywhere]">{item.name}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(item.id)}
            aria-label={`Usuń ${item.name}`}
            className="shrink-0 rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
