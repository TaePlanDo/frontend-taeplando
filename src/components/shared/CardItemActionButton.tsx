import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

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
        "gap-1.5 border-transparent bg-transparent text-foreground/80 hover:bg-foreground/10 cursor-pointer",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
}
