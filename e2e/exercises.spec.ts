import { test } from "./playwright";

test.describe("exercise management", () => {
  test.fixme("lists the catalog and manages a trainer-owned exercise", async () => {
    // Blocked by SCRUM-129: the exercises route and its UI do not exist yet.
  });

  test.fixme("shows validation for a missing required field", async () => {
    // Blocked by SCRUM-129: there is no exercise form to exercise in the browser.
  });
});
