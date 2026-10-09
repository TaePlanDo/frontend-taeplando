import type { ComponentProps } from "react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { startGoogleLogin } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

type AuthGoogleButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "onClick" | "type"
> & {
  children?: string;
};

export function AuthGoogleButton({
  className,
  children = "Dołącz z Google",
  ...props
}: AuthGoogleButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      onClick={startGoogleLogin}
      className={cn(
        "w-full border border-[#6B4A38] bg-[#2A201C] text-white hover:bg-[#3A2A24]",
        className,
      )}
      {...props}
    >
      <FcGoogle className="size-5" aria-hidden />
      {children}
    </Button>
  );
}
