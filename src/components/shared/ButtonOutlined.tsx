import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonOutlinedProps = ComponentProps<typeof Button> & {
  tone?: "default" | "danger";
};

export function ButtonOutlined({
  className,
  tone = "default",
  children,
  ...props
}: ButtonOutlinedProps) {
  return (
    <Button
      size="lg"
      className={cn(
        "rounded-full border-2 text-white transition-colors",
        tone === "default" &&
          "border-[#E4662C] hover:border-white/70 hover:text-[#E4662C]",
        tone === "danger" &&
          "border-[#C22108] hover:border-white/70 hover:text-[#C22108]",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
