import { NavLink } from "react-router-dom";

import { Logo } from "@/components/shared/Logo";

export function NavbarHeader() {
  return (
    <NavLink
      to="/"
      end
      className="flex items-center gap-2"
      aria-label="TaePlanDo - strona główna"
    >
      <Logo className="h-12 w-auto" aria-hidden />
      <span className="text-2xl font-semibold text-foreground">
        TaePlan<span className="text-primary">Do</span>
      </span>
    </NavLink>
  );
}
