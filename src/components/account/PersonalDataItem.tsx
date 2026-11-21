import type { ReactNode } from "react";

type PersonalDataItemProps = {
  title: string;
  value: string;
  action?: ReactNode;
};

export function PersonalDataItem({
  title,
  value,
  action,
}: PersonalDataItemProps) {
  return (
    <div className="min-w-0 space-y-1 border-b border-foreground/20 py-4">
      <dt className="text-xs font-medium text-primary">{title}</dt>
      <dd className="flex min-w-0 items-center justify-between gap-4">
        <span className="min-w-0 text-base text-foreground [overflow-wrap:anywhere]">
          {value}
        </span>
        {action}
      </dd>
    </div>
  );
}
