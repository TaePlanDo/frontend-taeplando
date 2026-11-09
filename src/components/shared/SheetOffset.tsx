import { createContext, useContext, useState, type ReactNode } from "react";

export const SHEET_WIDTH = 420;

type SheetOffsetContextValue = {
  offset: number;
  setOffset: (offset: number) => void;
};

const SheetOffsetContext = createContext<SheetOffsetContextValue>({
  offset: 0,
  setOffset: () => {},
});

export function SheetOffsetProvider({ children }: { children: ReactNode }) {
  const [offset, setOffset] = useState(0);
  return (
    <SheetOffsetContext.Provider value={{ offset, setOffset }}>
      {children}
    </SheetOffsetContext.Provider>
  );
}

export function useSheetOffset() {
  return useContext(SheetOffsetContext);
}
