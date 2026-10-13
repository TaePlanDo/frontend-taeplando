import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NAV_ITEMS, navLinkClassName } from "./navItems";

export function NavbarMobileNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="inline-flex size-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
        aria-label="Otwórz menu nawigacji"
      >
        <button type="button">
          <Menu className="size-5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 border-white/10 bg-[#181818] text-white"
      >
        {NAV_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.to}
            asChild
            className="cursor-pointer focus:bg-white/10 focus:text-white"
          >
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => navLinkClassName({ isActive })}
            >
              {item.label}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
