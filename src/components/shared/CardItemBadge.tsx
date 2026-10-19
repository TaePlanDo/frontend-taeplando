import type { ComponentProps, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

type CardItemBadgeProps = ComponentProps<typeof Badge> & {
  icon?: ReactNode;
};

export function CardItemBadge({
  className,
  icon,
  children,
  ...props
}: CardItemBadgeProps) {
  return (
    <Badge
      variant="ghost"
      className={cn(
        "gap-1.5 rounded-full border border-[#45355A] bg-transparent px-3 py-1 text-[#D8D3EA]",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Badge>
  );
}
