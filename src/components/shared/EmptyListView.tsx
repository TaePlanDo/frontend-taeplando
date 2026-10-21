import type { ReactNode } from "react";

import { Frown } from "lucide-react";

import { cn } from "cn";

type EmptyListViewProps = {
  title: string;
  message: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function EmptyListView({
  title,
  message,
  icon,
  children,
  className,
}: EmptyListViewProps) {
  return (
    <div
      className={cn(
        "flex h-92 flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center",
        className,
      )}
    >
      {icon ?? <Frown className="h-12 w-12 text-foreground/40" />}
      <h3 className="text-foreground/80">{title}</h3>
      <p className="text-foreground/60">{message}</p>
      {children}
    </div>
  );
}
