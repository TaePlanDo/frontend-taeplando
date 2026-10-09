import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthButtonProps = ComponentProps<typeof Button>;

export function AuthButton({ className, children, ...props }: AuthButtonProps) {
  return (
    <Button
      size="lg"
      className={cn(
        "w-full bg-gradient-to-r from-[#D35400] to-[#F0B429] text-white hover:opacity-90",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
