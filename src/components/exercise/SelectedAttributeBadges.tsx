import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type AttributeItem = {
  id: string | number;
  name: string;
};

type Props = {
  items: AttributeItem[];
  onRemove: (id: string) => void;
};

export function SelectedAttributeBadges({ items, onRemove }: Props) {
  return (
    <div className="mt-3 flex min-h-8 flex-wrap gap-2">
      {items.map((item) => (
        <Badge
          key={item.id}
          variant="secondary"
          className="gap-1.5 px-2.5 py-1"
        >
          {item.name}
          <button
            type="button"
            onClick={() => onRemove(String(item.id))}
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
