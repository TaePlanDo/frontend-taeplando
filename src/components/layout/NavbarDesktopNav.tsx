import { NAV_ITEMS } from "./navItems";
import { NavbarItem } from "./NavbarItem";

export function NavbarDesktopNav() {
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {NAV_ITEMS.map((item) => (
        <NavbarItem key={item.to} item={item} />
      ))}
    </ul>
  );
}
