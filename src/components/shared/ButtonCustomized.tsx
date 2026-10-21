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
    "w-full bg-gradient-to-r from-primary to-primary-foreground text-foreground hover:opacity-90",
  hero: "pt-6 pb-7 border-2 border-primary w-full rounded-md bg-gradient-to-r from-primary to-primary-foreground text-xl font-semibold text-foreground shadow-sm shadow-primary-foreground/70 transition-all hover:opacity-85",
  outline:
    "rounded-full border-2 border-primary bg-transparent text-foreground transition-colors hover:bg-transparent hover:border-foreground/70",
  danger:
    "rounded-full border-2 border-destructive bg-transparent text-foreground transition-colors hover:bg-transparent hover:border-foreground/70",
  google: "w-full border bg-accent text-accent-foreground hover:bg-accent/90",
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
