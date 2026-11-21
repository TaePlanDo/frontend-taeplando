import { NavbarDesktopNav } from "./NavbarDesktopNav";
import { NavbarHeader } from "./NavbarHeader";
import { NavbarMobileNav } from "./NavbarMobileNav";
import { ThemeToggler } from "./ThemeToggler";

export function Navbar() {
  return (
    <header
      data-slot="navbar"
      className="sticky top-0 z-50 border-b border-foreground/10 bg-background w-full"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavbarHeader />
        <div className="flex items-center gap-1">
          <NavbarDesktopNav />
          <ThemeToggler />
          <NavbarMobileNav />
        </div>
      </nav>
    </header>
  );
}
