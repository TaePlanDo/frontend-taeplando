import { defineConfig, devices } from "@playwright/test";

import {
  apiOrigin,
  apiPort,
  backendDir,
  backendProcessEnv,
  fePort,
  frontendOrigin,
  frontendProcessEnv,
} from "./e2e/env";

function envForWebServer(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  globalSetup: "./e2e/globalSetup.ts",
  globalTeardown: "./e2e/globalTeardown.ts",
  use: {
    baseURL: frontendOrigin,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `uv run uvicorn app.main:app --app-dir src --host 127.0.0.1 --port ${apiPort}`,
      cwd: backendDir,
      url: `${apiOrigin}/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: envForWebServer(backendProcessEnv()),
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${fePort}`,
      url: frontendOrigin,
      reuseExistingServer: false,
      timeout: 120_000,
      env: envForWebServer(frontendProcessEnv()),
    },
  ],
});
