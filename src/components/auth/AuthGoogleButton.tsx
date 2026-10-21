import type { ComponentProps } from "react";
import { FcGoogle } from "react-icons/fc";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { startGoogleLogin } from "@/lib/api/auth";

type AuthGoogleButtonProps = Omit<
  ComponentProps<typeof CustomizedButton>,
  "children" | "onClick" | "type" | "variant"
> & {
  children?: string;
};

export function AuthGoogleButton({
  className,
  children = "Dołącz z Google",
  ...props
}: AuthGoogleButtonProps) {
  return (
    <CustomizedButton
      type="button"
      variant="google"
      onClick={startGoogleLogin}
      className={className}
      {...props}
    >
      <FcGoogle className="size-5" aria-hidden />
      {children}
    </CustomizedButton>
  );
}
