import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export type ExerciseFormValues = {
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  minParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
};

export class ExercisesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addExerciseButton: Locator;
  readonly exerciseDialog: Locator;
  readonly emptyListMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", {
      name: "Wszystkie ćwiczenia",
    });
    this.addExerciseButton = page.getByRole("button", {
      name: "Dodaj ćwiczenie",
    });
    this.exerciseDialog = page.getByRole("dialog");
    this.emptyListMessage = page.getByText("Jeszcze nie masz żadnych ćwiczeń");
  }

  async goto(): Promise<void> {
    await this.page.goto("/exercises");
    await expect(this.heading).toBeVisible();
  }

  async createExercise(values: ExerciseFormValues): Promise<void> {
    await this.addExerciseButton.click();
    await expect(this.exerciseDialog).toBeVisible();
    await this.fillExerciseForm(values);
    await this.selectAttribute("Typ", "Technika");
    await this.selectAttribute("Segment", "Część główna");
    await this.exerciseDialog
      .getByRole("button", { name: "Stwórz ćwiczenie" })
      .click();
    await expect(this.exerciseDialog).toHaveCount(0);
  }

  async editExercise(
    currentName: string,
    values: ExerciseFormValues,
  ): Promise<void> {
    await this.exerciseCard(currentName)
      .getByRole("button", { name: "Edytuj" })
      .click();
    await expect(this.exerciseDialog).toBeVisible();
    await this.fillExerciseForm(values);
    await this.exerciseDialog
      .getByRole("button", { name: "Edytuj ćwiczenie" })
      .click();
    await expect(this.exerciseDialog).toHaveCount(0);
  }

  async deactivateExercise(name: string): Promise<void> {
    await this.exerciseCard(name).getByRole("button", { name: "Usuń" }).click();

    const confirmationDialog = this.page.getByRole("alertdialog", {
      name: "Usuwanie ćwiczenia",
    });
    await expect(confirmationDialog).toBeVisible();
    await confirmationDialog.getByRole("button", { name: "Usuń" }).click();
  }

  async submitInvalidExercise(): Promise<void> {
    await this.addExerciseButton.click();
    await expect(this.exerciseDialog).toBeVisible();
    await this.exerciseDialog
      .getByRole("button", { name: "Stwórz ćwiczenie" })
      .click();
  }

  async expectExercise(name: string): Promise<void> {
    const card = this.exerciseCard(name);
    await expect(card).toBeVisible();
    await expect(card).toContainText("Technika");
    await expect(card).toContainText("Część główna");
  }

  async expectNoExercises(): Promise<void> {
    await expect(this.emptyListMessage).toBeVisible();
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(this.exerciseDialog.getByText(message)).toBeVisible();
    await expect(this.exerciseDialog).toBeVisible();
  }

  private async selectAttribute(tab: "Typ" | "Segment", value: string) {
    await this.exerciseDialog
      .getByRole("button", { name: new RegExp(`^${tab}`) })
      .click();
    await this.exerciseDialog
      .getByLabel(`Dodaj ${tab.toLowerCase()}`)
      .selectOption({ label: value });
  }

  private exerciseCard(name: string): Locator {
    return this.page
      .locator('[data-slot="card"]')
      .filter({ has: this.page.getByRole("heading", { name, exact: true }) });
  }

  private async fillExerciseForm(values: ExerciseFormValues): Promise<void> {
    await this.exerciseDialog
      .getByRole("textbox", { name: "Nazwa ćwiczenia" })
      .fill(values.name);
    await this.exerciseDialog
      .getByRole("textbox", { name: "Opis" })
      .fill(values.description);
    await this.exerciseDialog
      .getByRole("spinbutton", { name: "Minimalny wiek" })
      .fill(String(values.minAge));
    await this.exerciseDialog
      .getByRole("spinbutton", { name: "Maksymalny wiek" })
      .fill(String(values.maxAge));
    await this.exerciseDialog
      .getByRole("spinbutton", { name: "Minimalna liczba uczestników" })
      .fill(String(values.minParticipants));
    await this.exerciseDialog
      .getByRole("spinbutton", { name: "Maksymalna liczba uczestników" })
      .fill(String(values.maxParticipants));
    await this.exerciseDialog
      .getByRole("spinbutton", { name: "Czas trwania w minutach" })
      .fill(String(values.durationMinutes));
  }
}
