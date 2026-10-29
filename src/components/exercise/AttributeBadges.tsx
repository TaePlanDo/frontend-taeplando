import { CardItemBadge } from "@/components/shared/CardItemBadge";

type AttributeBadgesProps = {
  label: string;
  names: string[];
  className: string;
};

export function AttributeBadges({
  label,
  names,
  className,
}: AttributeBadgesProps) {
  if (!names.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1" aria-label={label}>
      {names.map((name) => (
        <CardItemBadge key={name} className={className}>
          {name}
        </CardItemBadge>
      ))}
    </div>
  );
}
