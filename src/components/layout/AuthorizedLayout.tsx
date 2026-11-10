import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/layout/Navbar";
import { useSheetOffset } from "@/hooks/useSheetOffset";

export function AuthorizedLayout() {
  const { offset } = useSheetOffset();

  return (
    <div
      className="flex min-h-dvh flex-col bg-background text-foreground transition-[padding] duration-300 ease-in-out"
      style={{ paddingLeft: offset ? `${offset}px` : undefined }}
    >
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
