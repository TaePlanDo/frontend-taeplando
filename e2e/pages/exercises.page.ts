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

export type ExerciseAttributes = {
  trainingType?: string;
  segment?: string;
  equipment?: string;
};

export class ExercisesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addExerciseButton: Locator;
  readonly exerciseDialog: Locator;
  readonly emptyListMessage: Locator;
  readonly listAlert: Locator;
  readonly retryButton: Locator;

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
    this.listAlert = page.getByRole("alert");
    this.retryButton = this.listAlert.getByRole("button", {
      name: "Spróbuj ponownie",
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/exercises");
    await expect(this.heading).toBeVisible();
  }

  async openFromNav(): Promise<void> {
    await this.page.getByRole("link", { name: "Ćwiczenia" }).click();
    await expect(this.heading).toBeVisible();
  }

  async createExercise(
    values: ExerciseFormValues,
    attributes: ExerciseAttributes = {},
  ): Promise<void> {
    await this.addExerciseButton.click();
    await expect(this.exerciseDialog).toBeVisible();
    await this.fillExerciseForm(values);
    await this.selectAttribute("Typ", attributes.trainingType ?? "Technika");
    await this.selectAttribute("Segment", attributes.segment ?? "Część główna");
    if (attributes.equipment) {
      await this.selectAttribute("Sprzęt", attributes.equipment);
    }
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

  async submitExerciseWithoutAttributes(
    values: ExerciseFormValues,
  ): Promise<void> {
    await this.addExerciseButton.click();
    await expect(this.exerciseDialog).toBeVisible();
    await this.fillExerciseForm(values);
    await this.exerciseDialog
      .getByRole("button", { name: "Stwórz ćwiczenie" })
      .click();
  }

  async openAttributeTab(tab: "Sprzęt" | "Typ" | "Segment"): Promise<void> {
    await this.exerciseDialog
      .getByRole("tab", { name: new RegExp(`^${tab}`) })
      .click();
  }

  async expectExercise(
    name: string,
    attributes: ExerciseAttributes = {},
  ): Promise<void> {
    const card = this.exerciseCard(name);
    await expect(card).toBeVisible();
    await expect(card).toContainText(attributes.trainingType ?? "Technika");
    await expect(card).toContainText(attributes.segment ?? "Część główna");
    if (attributes.equipment) {
      await expect(card.getByLabel("Sprzęt")).toContainText(
        attributes.equipment,
      );
    }
  }

  async expectNoExercises(): Promise<void> {
    await expect(this.emptyListMessage).toBeVisible();
  }

  async openDetails(name: string): Promise<void> {
    await this.exerciseCard(name)
      .getByRole("button", { name: `Pokaż szczegóły: ${name}` })
      .click();
    await expect(this.exerciseDialog).toBeVisible();
    await expect(
      this.exerciseDialog.getByRole("heading", { name: "Podgląd ćwiczenia" }),
    ).toBeVisible();
  }

  async expectDetails(
    values: ExerciseFormValues,
    attributes: ExerciseAttributes = {},
  ): Promise<void> {
    const dialog = this.exerciseDialog;
    await expect(
      dialog.getByRole("heading", { name: values.name, exact: true }),
    ).toBeVisible();
    await expect(dialog.getByText(values.description)).toBeVisible();
    await expect(
      dialog.getByText(`${values.minAge}-${values.maxAge} lat`).first(),
    ).toBeVisible();
    await expect(
      dialog
        .getByText(`${values.minParticipants}-${values.maxParticipants} osób`)
        .first(),
    ).toBeVisible();
    await expect(
      dialog.getByText(`${values.durationMinutes} minut`).first(),
    ).toBeVisible();

    await expect(dialog.getByLabel("Typ")).toContainText(
      attributes.trainingType ?? "Technika",
    );
    await expect(dialog.getByLabel("Segment")).toContainText(
      attributes.segment ?? "Część główna",
    );
    if (attributes.equipment) {
      await expect(dialog.getByLabel("Sprzęt")).toContainText(
        attributes.equipment,
      );
    }
  }

  async expectOfflineError(): Promise<void> {
    await expect(this.listAlert).toBeVisible();
    await expect(
      this.listAlert.getByText("Brak połączenia z internetem"),
    ).toBeVisible();
    await expect(
      this.listAlert.getByText("Połącz się z internetem i spróbuj ponownie"),
    ).toBeVisible();
    await expect(this.retryButton).toBeVisible();
    await expect(this.emptyListMessage).toHaveCount(0);
    await expect(this.page.locator('[data-slot="card"]')).toHaveCount(0);
  }

  async retryList(): Promise<void> {
    await expect(this.retryButton).toBeVisible();
    await this.retryButton.click();
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(this.exerciseDialog.getByText(message)).toBeVisible();
    await expect(this.exerciseDialog).toBeVisible();
  }

  async searchByName(name: string): Promise<void> {
    await this.page
      .getByRole("textbox", { name: "Wyszukaj ćwiczenie" })
      .fill(name);
    await expect
      .poll(() => new URL(this.page.url()).searchParams.get("name"))
      .toBe(name);
  }

  async clearSearch(): Promise<void> {
    await this.page
      .getByRole("textbox", { name: "Wyszukaj ćwiczenie" })
      .fill("");
    await expect(this.page).not.toHaveURL(/[?&]name=/);
  }

  private async selectAttribute(
    tab: "Sprzęt" | "Typ" | "Segment",
    value: string,
  ) {
    await this.exerciseDialog
      .getByRole("tab", { name: new RegExp(`^${tab}`) })
      .click();
    await this.exerciseDialog
      .getByRole("combobox", { name: `Dodaj ${tab.toLowerCase()}` })
      .click();
    await this.page.getByRole("option", { name: value, exact: true }).click();
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
