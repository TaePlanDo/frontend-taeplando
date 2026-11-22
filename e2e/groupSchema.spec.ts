import type { Page } from "@playwright/test";

import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { expect, test } from "./playwright";
import { GroupsPage } from "./pages/groups.page";

const groupValues = {
  name: "Grupa schematu",
  minAge: 7,
  maxAge: 14,
  durationMinutes: 60,
};

async function setupGroupWithSchemaPage(page: Page): Promise<GroupsPage> {
  await createLocalTrainerAndLogin(page);
  const groups = new GroupsPage(page);
  await groups.goto();
  await groups.createGroup(groupValues);
  return groups;
}

test.describe("group schema", () => {
  test("adds a segment to a group schema and saves", async ({ page }) => {
    const groups = await setupGroupWithSchemaPage(page);

    await groups.openSchema(groupValues.name);
    await groups.addSchemaSegment("Rozgrzewka");
    await groups.expectSchemaSegments(["Ćwiczenia", "Rozgrzewka"]);
    await groups.saveSchema();
    await groups.expectSchemaSaved();

    await groups.openSchema(groupValues.name);
    await groups.expectSchemaSegments(["Ćwiczenia", "Rozgrzewka"]);
  });

  test("removes a segment and saves after manually reallocating its share", async ({
    page,
  }) => {
    const groups = await setupGroupWithSchemaPage(page);

    await groups.openSchema(groupValues.name);
    await groups.addSchemaSegment("Rozgrzewka");
    await groups.addSchemaSegment("Rozciąganie");

    await groups.removeSchemaSegment("Rozgrzewka");
    await groups.expectSchemaSegments(["Ćwiczenia", "Rozciąganie"]);
    await groups.expectSchemaSegmentAbsent("Rozgrzewka");
    const rows = groups.groupDialog.getByRole("list", {
      name: "Kolejność segmentów",
    });
    await expect(
      rows.locator("li").filter({ hasText: "Ćwiczenia" }),
    ).toContainText("(98%)");
    await expect(
      rows.locator("li").filter({ hasText: "Rozciąganie" }),
    ).toContainText("(1%)");
    await expect(
      groups.groupDialog.getByText("SUMA 99%", { exact: true }),
    ).toBeVisible();
    await expect(
      groups.groupDialog.getByRole("button", { name: "Zapisz schemat" }),
    ).toBeDisabled();

    await groups.groupDialog
      .getByRole("button", { name: "Zwiększ udział: Ćwiczenia", exact: true })
      .click();
    await expect(
      rows.locator("li").filter({ hasText: "Rozciąganie" }),
    ).toContainText("(1%)");
    await groups.saveSchema();
    await groups.expectSchemaSaved();

    await groups.openSchema(groupValues.name);
    await groups.expectSchemaSegments(["Ćwiczenia", "Rozciąganie"]);
    await groups.expectSchemaSegmentAbsent("Rozgrzewka");
    await expect(
      rows.locator("li").filter({ hasText: "Ćwiczenia" }),
    ).toContainText("(99%)");
    await expect(
      rows.locator("li").filter({ hasText: "Rozciąganie" }),
    ).toContainText("(1%)");
  });
});
