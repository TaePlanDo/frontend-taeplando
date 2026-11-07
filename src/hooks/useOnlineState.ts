import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

export function useOnlineState() {
  return useSyncExternalStore(
    (onStoreChange) => onlineManager.subscribe(onStoreChange),
    () => onlineManager.isOnline(),
    () => true,
  );
}
