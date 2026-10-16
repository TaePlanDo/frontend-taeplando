import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CardItemActionButtonProps = ComponentProps<typeof Button> & {
  icon?: ReactNode;
};

export function CardItemActionButton({
  className,
  icon,
  children,
  ...props
}: CardItemActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-1.5 border-transparent bg-transparent text-white/80 hover:bg-white/10",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}
