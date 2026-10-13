import type { ComponentProps } from "react";
import { FcGoogle } from "react-icons/fc";

import { ButtonCustomized } from "@/components/shared/ButtonCustomized";
import { startGoogleLogin } from "@/lib/api/auth";

type AuthGoogleButtonProps = Omit<
  ComponentProps<typeof ButtonCustomized>,
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
    <ButtonCustomized
      type="button"
      variant="google"
      onClick={startGoogleLogin}
      className={className}
      {...props}
    >
      <FcGoogle className="size-5" aria-hidden />
      {children}
    </ButtonCustomized>
  );
}
