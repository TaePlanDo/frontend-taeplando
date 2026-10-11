import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ButtonCustomized({
  className,
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      size="lg"
      className={cn(
        "group pt-6 pb-7 border-2 border-[#9F290C] w-full rounded-md bg-gradient-to-r from-[#D35400] to-[#F0B429] text-xl font-semibold text-white shadow-[0_12px_32px_-12px_rgba(211,84,0,0.8)] transition-all hover:opacity-90",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
