import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class PlanDetailPage {
  readonly page: Page;
  readonly regenerateButton: Locator;
  readonly regenerateDialog: Locator;
  readonly alternativesDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.regenerateButton = page.getByRole("button", {
      name: "Wygeneruj ponownie",
    });
    this.regenerateDialog = page.getByRole("dialog", {
      name: "Potwierdź liczebność grupy",
    });
    this.alternativesDialog = page.getByRole("dialog", {
      name: "Wymień ćwiczenie",
    });
  }

  planId(): string {
    const match = this.page.url().match(/\/plans\/([^/?#]+)/);
    if (!match?.[1] || match[1] === "new" || match[1] === "generation") {
      throw new Error(`Expected a plan detail URL, got ${this.page.url()}`);
    }
    return match[1];
  }

  async planName(): Promise<string> {
    return this.page.getByRole("heading", { level: 1 }).innerText();
  }

  async firstExerciseName(): Promise<string> {
    return (await this.exerciseNames())[0];
  }

  async exerciseNames(): Promise<string[]> {
    const headings = this.page.getByRole("heading", { level: 4 });
    await expect(headings.first()).toBeVisible();
    return headings.evaluateAll((nodes) =>
      nodes.map((node) => (node.textContent ?? "").trim()),
    );
  }

  async expectPlan(groupName: string): Promise<void> {
    await expect(
      this.page.getByRole("heading", {
        name: new RegExp(`Plan treningowy.*${groupName}`),
      }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("heading", { level: 4 }).first(),
    ).toBeVisible();
  }

  async expectDifferentPlanThan(previousPlanId: string): Promise<void> {
    expect(this.planId()).not.toBe(previousPlanId);
  }

  async regenerate(): Promise<void> {
    await this.regenerateButton.click();
    await expect(this.regenerateDialog).toBeVisible();
    await this.regenerateDialog
      .getByRole("button", { name: "Generuj" })
      .click();
  }

  previewButton(name: string): Locator {
    return this.page.getByRole("button", {
      name: `Podgląd ćwiczenia ${name}`,
    });
  }

  replaceButton(name: string): Locator {
    return this.page.getByRole("button", {
      name: `Wymień ćwiczenie ${name}`,
    });
  }

  removeButton(name: string): Locator {
    return this.page.getByRole("button", {
      name: `Usuń ćwiczenie ${name}`,
    });
  }

  async expectExerciseAbsent(name: string): Promise<void> {
    await expect(this.previewButton(name)).toHaveCount(0);
  }

  async reorderFirstReorderablePair(): Promise<void> {
    const handles = this.page.getByRole("button", {
      name: /^Przenieś ćwiczenie /,
    });
    await expect(handles.first()).toBeVisible();

    const count = await handles.count();
    for (let index = 0; index < count - 1; index++) {
      if (
        !(await handles.nth(index).isEnabled()) ||
        !(await handles.nth(index + 1).isEnabled())
      ) {
        continue;
      }

      const names = await this.exerciseNames();
      const expected = [...names];
      [expected[index], expected[index + 1]] = [
        expected[index + 1],
        expected[index],
      ];

      await this.dragExercise(handles.nth(index), index + 1);
      await expect.poll(async () => this.exerciseNames()).toEqual(expected);
      return;
    }

    throw new Error("Expected a phase with at least two reorderable exercises");
  }

  private async dragExercise(
    source: Locator,
    targetExerciseIndex: number,
  ): Promise<void> {
    const target = this.page
      .getByRole("heading", { level: 4 })
      .nth(targetExerciseIndex);
    await source.scrollIntoViewIfNeeded();
    await target.scrollIntoViewIfNeeded();

    const from = await source.boundingBox();
    const to = await target.boundingBox();
    if (!from || !to) {
      throw new Error("Expected drag source and target to be visible");
    }

    const startX = from.x + from.width / 2;
    const startY = from.y + from.height / 2;
    const endX = to.x + to.width / 2;
    const endY = to.y + to.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    // PointerSensor requires 6px movement before the drag activates.
    await this.page.mouse.move(startX, startY + 8, { steps: 4 });
    await this.page.mouse.move(endX, endY, { steps: 25 });
    await this.page.mouse.up();
  }

  async renamePlan(newName: string): Promise<void> {
    await this.page.getByRole("button", { name: "Edytuj nazwę planu" }).click();
    const input = this.page.getByRole("textbox", { name: "Nazwa planu" });
    await expect(input).toBeVisible();
    await input.fill(newName);
    await input.press("Enter");
    await expect(
      this.page.getByRole("heading", { level: 1, name: newName }),
    ).toBeVisible();
  }

  async replaceExercise(name: string): Promise<void> {
    await this.replaceButton(name).click();
    await expect(this.alternativesDialog).toBeVisible();

    const radio = this.alternativesDialog.getByRole("radio").first();
    await expect(radio).toBeVisible();
    await radio.click();

    const submit = this.alternativesDialog.getByRole("button", {
      name: "Wymień ćwiczenie",
    });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(this.alternativesDialog).toHaveCount(0);
    await expect(
      this.page.getByText("Ćwiczenie zostało wymienione"),
    ).toBeVisible();
  }

  async removeExercise(name: string): Promise<void> {
    await this.removeButton(name).click();
    const confirmation = this.page.getByRole("alertdialog", {
      name: "Usuń ćwiczenie z planu",
    });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole("button", { name: "Usuń" }).click();
    await expect(confirmation).toHaveCount(0);
    await expect(
      this.page.getByText("Ćwiczenie zostało usunięte z planu"),
    ).toBeVisible();
  }
}
