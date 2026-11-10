import type { ReactNode } from "react";

type GroupSessionStatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

export function GroupSessionStatCard({
  icon,
  label,
  value,
}: GroupSessionStatCardProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-border bg-background/30 px-3 py-3">
      <div className="flex items-center gap-2 text-primary">{icon}</div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-semibold text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}
