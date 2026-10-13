import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  to: string;
  end?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Start", to: "/", end: true },
  { label: "Konto", to: "/account" },
];

export function navLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    "text-white/70 transition-colors hover:text-white",
    isActive && "text-[#EC6212] hover:text-[#EC6212]",
  );
}
