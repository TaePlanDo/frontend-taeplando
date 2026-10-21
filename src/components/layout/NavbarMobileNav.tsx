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
        className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground lg:hidden"
        aria-label="Otwórz menu nawigacji"
      >
        <button type="button">
          <Menu className="size-5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 border-foreground/10 bg-background text-foreground"
      >
        {NAV_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.to}
            asChild
            className="cursor-pointer focus:bg-foreground/10 focus:text-foreground"
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
