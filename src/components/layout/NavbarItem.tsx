import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

import { type NavItem, navLinkClassName } from "./navItems";

export function NavbarItem({ item }: { item: NavItem }) {
  return (
    <li>
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          cn(
            "rounded-md px-3 py-2 text-sm font-medium",
            navLinkClassName({ isActive }),
          )
        }
      >
        {item.label}
      </NavLink>
    </li>
  );
}
