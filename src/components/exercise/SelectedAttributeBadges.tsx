import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type AttributeItem<TId extends string | number> = {
  id: TId;
  name: string;
};

type Props<TId extends string | number> = {
  items: AttributeItem<TId>[];
  onRemove: (id: TId) => void;
};

export function SelectedAttributeBadges<TId extends string | number>({
  items,
  onRemove,
}: Props<TId>) {
  if (!items.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge
          key={item.id}
          variant="secondaryOutline"
          className="gap-1.5 px-2.5 py-1"
        >
          {item.name}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Usuń ${item.name}`}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
