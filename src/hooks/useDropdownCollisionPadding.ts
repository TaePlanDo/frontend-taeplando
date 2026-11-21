import { useSyncExternalStore } from "react";

import { DROPDOWN_SPACING } from "@/lib/constants/dropdown";

const NAVBAR_SELECTOR = '[data-slot="navbar"]';

function getNavbarBottom() {
  return (
    document.querySelector(NAVBAR_SELECTOR)?.getBoundingClientRect().bottom ?? 0
  );
}

function subscribe(onChange: () => void) {
  const navbar = document.querySelector(NAVBAR_SELECTOR);
  const observer = new ResizeObserver(onChange);
  if (navbar) observer.observe(navbar);
  window.addEventListener("resize", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("resize", onChange);
  };
}

export function useDropdownCollisionPadding() {
  const navbarBottom = useSyncExternalStore(
    subscribe,
    getNavbarBottom,
    () => 0,
  );
  return {
    top: navbarBottom + DROPDOWN_SPACING,
    right: DROPDOWN_SPACING,
    bottom: DROPDOWN_SPACING,
    left: DROPDOWN_SPACING,
  };
}
