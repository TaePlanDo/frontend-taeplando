import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

import type { NavItem } from "./navItems";

export function NavbarItem({ item }: { item: NavItem }) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            "rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white",
            isActive && "text-[#EC6212] hover:text-[#EC6212]",
          )
        }
      >
        {item.label}
      </NavLink>
    </li>
  );
}
