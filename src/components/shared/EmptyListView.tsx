import type { ReactNode } from "react";

import { Frown } from "lucide-react";

import { cn } from "cn";

type EmptyListViewProps = {
  title: string;
  message: string;
  icon?: ReactNode;
  className?: string;
};

export function EmptyListView({
  title,
  message,
  icon,
  className,
}: EmptyListViewProps) {
  return (
    <div
      className={cn(
        "flex h-92 flex-col items-center justify-center gap-2 rounded-2xl border border-[#45355A] p-4 text-center",
        className,
      )}
    >
      {icon ?? <Frown className="h-12 w-12 text-white/40" />}
      <h3 className="text-white/80">{title}</h3>
      <p className="text-white/60">{message}</p>
    </div>
  );
}
