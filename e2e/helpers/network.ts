import type { Page } from "@playwright/test";

export async function setAppOffline(
  page: Page,
  offline: boolean,
): Promise<void> {
  await page.evaluate((isOffline) => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => !isOffline,
    });
    window.dispatchEvent(new Event(isOffline ? "offline" : "online"));
  }, offline);
}
