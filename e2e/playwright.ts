import { test as base } from "@playwright/test";

import { resetDb } from "./helpers/resetDb";

type AutoFixtures = {
  /** Auto: truncate e2e DB before each test. */
  clearDatabase: void;
};

/**
 * Drop-in for `@playwright/test` in e2e specs:
 * `import { test, expect } from "./playwright"`
 */
export * from "@playwright/test";

export const test = base.extend<AutoFixtures>({
  clearDatabase: [
    // Playwright requires object destructuring for the first fixture arg.
    // eslint-disable-next-line no-empty-pattern -- no fixture deps
    async ({}, use) => {
      resetDb();
      await use();
    },
    { auto: true },
  ],
});
