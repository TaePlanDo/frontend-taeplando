import { NavbarDesktopNav } from "./NavbarDesktopNav";
import { NavbarHeader } from "./NavbarHeader";
import { NavbarMobileNav } from "./NavbarMobileNav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavbarHeader />
        <NavbarDesktopNav />
        <NavbarMobileNav />
      </nav>
    </header>
  );
}
