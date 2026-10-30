import type { Page } from "@playwright/test";

export async function blockApi(
  page: Page,
  url: string,
): Promise<{ unblock: () => void }> {
  let blocked = true;

  await page.route(url, async (route) => {
    if (blocked) {
      await route.abort("internetdisconnected");
      return;
    }
    await route.continue();
  });

  return {
    unblock: () => {
      blocked = false;
    },
  };
}
