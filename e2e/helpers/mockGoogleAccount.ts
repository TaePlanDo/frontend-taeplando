import type { Page } from "@playwright/test";
import { frontendOrigin } from "../env";

export async function mockGoogleAccount(page: Page): Promise<void> {
  await page.route(`${frontendOrigin}/api/auth/refresh`, (route) =>
    route.fulfill({
      json: {
        access_token: "e2e-mocked-access-token",
        token_type: "bearer",
        expires_in: 900,
      },
    }),
  );

  await page.route(`${frontendOrigin}/api/auth/me`, (route) =>
    route.fulfill({
      json: {
        id: "00000000-0000-0000-0000-000000000001",
        email: "google@example.com",
        full_name: "Google User",
        auth_method: "GOOGLE",
      },
    }),
  );
}
