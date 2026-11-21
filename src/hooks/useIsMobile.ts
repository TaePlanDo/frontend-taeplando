import { useSyncExternalStore } from "react";

// Match the `sm` breakpoint used by the form layouts.
const mobileQuery = "(width < 640px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(mobileQuery).matches,
    () => false,
  );
}
