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
    const heading = this.page.getByRole("heading", { level: 4 }).first();
    await expect(heading).toBeVisible();
    return (await heading.innerText()).trim();
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
