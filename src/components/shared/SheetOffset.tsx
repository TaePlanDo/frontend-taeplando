import { useState, type ReactNode } from "react";

import { SheetOffsetContext } from "@/hooks/useSheetOffset";

export function SheetOffsetProvider({ children }: { children: ReactNode }) {
  const [offset, setOffset] = useState(0);
  return (
    <SheetOffsetContext.Provider value={{ offset, setOffset }}>
      {children}
    </SheetOffsetContext.Provider>
  );
}
