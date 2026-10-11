export type NavItem = {
  label: string;
  to: string;
  end: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Start", to: "/", end: true },
  // add other pages here later TODO
];
