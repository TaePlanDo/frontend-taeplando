import { createContext, useContext } from "react";

export const SHEET_WIDTH = 420;

type SheetOffsetContextValue = {
  offset: number;
  setOffset: (offset: number) => void;
};

export const SheetOffsetContext = createContext<SheetOffsetContextValue>({
  offset: 0,
  setOffset: () => {},
});

export function useSheetOffset() {
  return useContext(SheetOffsetContext);
}
