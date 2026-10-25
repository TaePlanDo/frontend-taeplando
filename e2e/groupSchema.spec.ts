import type { Page } from "@playwright/test";

import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { test } from "./playwright";
import { GroupsPage } from "./pages/groups.page";

const groupValues = {
  name: "Grupa schematu",
  minAge: 7,
  maxAge: 14,
  hours: 1,
  minutes: 0,
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
    await groups.expectSchemaSegments(["Część główna", "Rozgrzewka"]);
    await groups.saveSchema();
    await groups.expectSchemaSaved();

    await groups.openSchema(groupValues.name);
    await groups.expectSchemaSegments(["Część główna", "Rozgrzewka"]);
  });

  test("removes a segment from a group schema and saves", async ({ page }) => {
    const groups = await setupGroupWithSchemaPage(page);

    await groups.openSchema(groupValues.name);
    await groups.addSchemaSegment("Rozgrzewka");
    await groups.addSchemaSegment("Wyciszenie");

    await groups.removeSchemaSegment("Rozgrzewka");
    await groups.expectSchemaSegments(["Część główna", "Wyciszenie"]);
    await groups.expectSchemaSegmentAbsent("Rozgrzewka");
    await groups.saveSchema();
    await groups.expectSchemaSaved();

    await groups.openSchema(groupValues.name);
    await groups.expectSchemaSegments(["Część główna", "Wyciszenie"]);
    await groups.expectSchemaSegmentAbsent("Rozgrzewka");
  });
});
