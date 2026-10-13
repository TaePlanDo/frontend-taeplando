import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/layout/Navbar";

export function AuthorizedLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#181818] text-white">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
