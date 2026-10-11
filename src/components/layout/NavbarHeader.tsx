import { NavLink } from "react-router-dom";

import { Logo } from "@/components/ui/logo";

export function NavbarHeader() {
  return (
    <NavLink
      to="/"
      end
      className="flex items-center gap-2"
      aria-label="TaePlanDo - strona główna"
    >
      <Logo className="h-9 w-auto" aria-hidden />
      <span className="text-lg font-semibold text-white">TaePlanDo</span>
    </NavLink>
  );
}
