import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

type ButtonCustomizedProps = Omit<ComponentProps<typeof Button>, "variant"> & {
  variant?: "primary" | "hero" | "outline" | "danger" | "google";
};

const variantClasses: Record<
  NonNullable<ButtonCustomizedProps["variant"]>,
  string
> = {
  primary:
    "w-full bg-gradient-to-r from-[#D35400] to-[#F0B429] text-white hover:opacity-90",
  hero: "pt-6 pb-7 border-2 border-[#9F290C] w-full rounded-md bg-gradient-to-r from-[#D35400] to-[#F0B429] text-xl font-semibold text-white shadow-[0_12px_32px_-12px_rgba(211,84,0,0.8)] transition-all hover:opacity-90",
  outline:
    "rounded-full border-2 border-[#E4662C] bg-transparent text-white transition-colors hover:border-white/70 hover:text-[#E4662C]",
  danger:
    "rounded-full border-2 border-[#C22108] bg-transparent text-white transition-colors hover:border-white/70 hover:text-[#C22108]",
  google:
    "w-full border border-[#6B4A38] bg-[#2A201C] text-white hover:bg-[#3A2A24]",
};

export function ButtonCustomized({
  className,
  variant = "outline",
  children,
  ...props
}: ButtonCustomizedProps) {
  return (
    <Button
      size="lg"
      className={cn(variantClasses[variant], "cursor-pointer", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
