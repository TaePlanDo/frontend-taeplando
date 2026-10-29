import type { ReactNode } from "react";

import { CardItemBadge } from "@/components/shared/CardItemBadge";

type AttributeBadgesProps = {
  label: string;
  names: string[];
  icon?: ReactNode;
  className: string;
  maxItems?: number;
};

export function AttributeBadges({
  label,
  names,
  icon,
  className,
  maxItems,
}: AttributeBadgesProps) {
  if (!names.length) return null;

  const visibleNames = maxItems ? names.slice(0, maxItems) : names;
  const hiddenNames = maxItems ? names.slice(maxItems) : [];

  return (
    <div className="flex flex-wrap items-center gap-1" aria-label={label}>
      {visibleNames.map((name) => (
        <CardItemBadge key={name} icon={icon} className={className}>
          {name}
        </CardItemBadge>
      ))}
      {hiddenNames.length ? (
        <CardItemBadge
          className={className}
          title={hiddenNames.join(", ")}
          aria-label={`${label}: dodatkowo ${hiddenNames.join(", ")}`}
        >
          +{hiddenNames.length}
        </CardItemBadge>
      ) : null}
    </div>
  );
}
