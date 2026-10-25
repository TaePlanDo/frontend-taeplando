import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type GroupFormValues = {
  name: string;
  minAge: number;
  maxAge: number;
  hours: number;
  minutes: number;
};

export class GroupsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addGroupButton: Locator;
  readonly groupDialog: Locator;
  readonly groupNameInput: Locator;
  readonly minAgeInput: Locator;
  readonly maxAgeInput: Locator;
  readonly hoursInput: Locator;
  readonly minutesInput: Locator;
  readonly emptyListMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      name: "Wszystkie grupy treningowe",
    });
    this.addGroupButton = page.getByRole("button", { name: "Dodaj grupę" });
    this.groupDialog = page.getByRole("dialog");
    this.groupNameInput = this.groupDialog.getByRole("textbox", {
      name: "Nazwa Grupy",
    });
    this.minAgeInput = this.groupDialog.getByRole("spinbutton", {
      name: "Minimalny",
    });
    this.maxAgeInput = this.groupDialog.getByRole("spinbutton", {
      name: "Maksymalny",
    });
    this.hoursInput = this.groupDialog.getByRole("spinbutton", {
      name: "Godziny",
    });
    this.minutesInput = this.groupDialog.getByRole("spinbutton", {
      name: "Minuty",
    });
    this.emptyListMessage = page.getByText("Jeszcze nie masz żadnych grup");
  }

  async goto(): Promise<void> {
    await this.page.goto("/groups");
    await expect(this.heading).toBeVisible();
  }

  async createGroup(values: GroupFormValues): Promise<void> {
    await this.addGroupButton.click();
    await expect(this.groupDialog).toBeVisible();
    await this.fillGroupForm(values);
    await this.groupDialog.getByRole("button", { name: "Utwórz" }).click();
    await expect(this.groupDialog).toHaveCount(0);
  }

  async editGroup(currentName: string, values: GroupFormValues): Promise<void> {
    await this.groupCard(currentName)
      .getByRole("button", { name: "Edytuj" })
      .click();
    await expect(this.groupDialog).toBeVisible();
    await this.fillGroupForm(values);
    await this.groupDialog
      .getByRole("button", { name: "Zapisz zmiany" })
      .click();
    await expect(this.groupDialog).toHaveCount(0);
  }

  async deleteGroup(name: string): Promise<void> {
    await this.groupCard(name).getByRole("button", { name: "Usuń" }).click();

    const confirmationDialog = this.page.getByRole("alertdialog", {
      name: "Usuwanie",
    });
    await expect(confirmationDialog).toBeVisible();
    await confirmationDialog.getByRole("button", { name: "Usuń" }).click();
  }

  async submitInvalidGroup(values: GroupFormValues): Promise<void> {
    await this.addGroupButton.click();
    await expect(this.groupDialog).toBeVisible();
    await this.fillGroupForm(values);
    await this.groupDialog.getByRole("button", { name: "Utwórz" }).click();
  }

  async expectGroup(
    name: string,
    minAge: number,
    maxAge: number,
    duration: string,
  ): Promise<void> {
    const card = this.groupCard(name);
    await expect(card).toBeVisible();
    await expect(card).toContainText(`${minAge}-${maxAge} lat`);
    await expect(card).toContainText(duration);
  }

  async expectNoGroups(): Promise<void> {
    await expect(this.emptyListMessage).toBeVisible();
  }

  async expectValidationError(message: string): Promise<void> {
    const error = this.groupDialog
      .getByRole("alert")
      .filter({ hasText: message });
    await expect(error).toContainText(message);
    await expect(this.groupDialog).toBeVisible();
  }

  async openSchema(groupName: string): Promise<void> {
    await this.groupCard(groupName)
      .getByRole("button", { name: "Schemat" })
      .click();
    await expect(this.groupDialog).toBeVisible();
    await expect(
      this.groupDialog.getByRole("heading", {
        name: `Schemat: ${groupName}`,
      }),
    ).toBeVisible();
    await expect(
      this.groupDialog.getByRole("region", { name: "Schemat treningu" }),
    ).toBeVisible();
  }

  async addSchemaSegment(segmentName: string): Promise<void> {
    await this.groupDialog
      .getByRole("combobox", { name: "Dodaj segment" })
      .click();
    await this.page.getByRole("option", { name: segmentName }).click();
  }

  async removeSchemaSegment(segmentName: string): Promise<void> {
    await this.groupDialog
      .getByRole("button", { name: `Usuń ${segmentName}` })
      .click();
  }

  async saveSchema(): Promise<void> {
    await this.groupDialog
      .getByRole("button", { name: "Zapisz schemat" })
      .click();
  }

  async expectSchemaSaved(): Promise<void> {
    await expect(
      this.page.getByText("Schemat grupy został zapisany"),
    ).toBeVisible();
    await expect(this.groupDialog).toHaveCount(0);
  }

  async expectSchemaSegments(names: string[]): Promise<void> {
    const list = this.groupDialog.getByRole("list", {
      name: "Kolejność segmentów",
    });
    await expect(list).toBeVisible();
    await expect(list.locator("li")).toHaveCount(names.length);
    for (const name of names) {
      await expect(list.locator("li").filter({ hasText: name })).toBeVisible();
    }
  }

  async expectSchemaSegmentAbsent(segmentName: string): Promise<void> {
    const list = this.groupDialog.getByRole("list", {
      name: "Kolejność segmentów",
    });
    await expect(
      list.locator("li").filter({ hasText: segmentName }),
    ).toHaveCount(0);
  }

  private groupCard(name: string): Locator {
    return this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByRole("heading", { name, exact: true }) });
  }

  private async fillGroupForm(values: GroupFormValues): Promise<void> {
    await this.groupNameInput.fill(values.name);
    await this.minAgeInput.fill(String(values.minAge));
    await this.maxAgeInput.fill(String(values.maxAge));
    await this.hoursInput.fill(String(values.hours));
    await this.minutesInput.fill(String(values.minutes));
  }
}
