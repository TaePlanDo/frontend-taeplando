import type { ReactNode } from "react";
import { cn } from "cn";

import { AttributeBadges } from "./AttributeBadges";

type AttributeRowProps = {
  label: string;
  names: string[];
  icon: ReactNode;
  badgeClassName: string;
};

export function AttributeRow({
  label,
  names,
  icon,
  badgeClassName,
}: AttributeRowProps) {
  return (
    <li className="flex min-w-0 items-start gap-3 rounded-lg border border-foreground/15 bg-muted/10 p-3">
      <span className="shrink-0 text-muted-foreground" aria-hidden>
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground">{label}</h3>
        {names.length ? (
          <AttributeBadges
            label={label}
            names={names}
            className={cn(
              "max-w-full whitespace-normal [overflow-wrap:anywhere]",
              badgeClassName,
            )}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Brak</p>
        )}
      </div>
    </li>
  );
}
