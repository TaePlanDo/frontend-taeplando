import { cn } from "cn";

export type NavItem = {
  label: string;
  to: string;
  end?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Start", to: "/", end: true },
  { label: "Grupy", to: "/groups" },
  { label: "Ćwiczenia", to: "/exercises" },
  { label: "Konto", to: "/account" },
];

export function navLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    "text-foreground hover:text-secondary",
    isActive && "border-2 border-primary/70 hover:text-primary",
  );
}
