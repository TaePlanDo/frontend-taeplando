import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/layout/Navbar";

export function AuthorizedLayout() {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background text-foreground transition-[padding] duration-300 ease-in-out"
      style={{ paddingLeft: "var(--filter-sheet-offset, 0px)" }}
    >
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
