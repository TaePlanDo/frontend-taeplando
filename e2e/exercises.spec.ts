import { seedSystemData } from "./helpers/backend";
import { createEquipment } from "./helpers/createEquipment";
import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { ExercisesPage } from "./pages/exercises.page";
import { expect, test } from "./playwright";

const exercise = {
  name: "E2E kopnięcie frontalne",
  description: "Ćwiczenie kopnięcia frontalnego na komendę.",
  minAge: 7,
  maxAge: 14,
  minParticipants: 2,
  maxParticipants: 16,
  durationMinutes: 10,
  physicalDifficulty: 4,
  technicalDifficulty: 2,
  upperBodyLoad: 1,
  lowerBodyLoad: 5,
  coreLoad: 3,
};

test.describe("exercise management", () => {
  test.beforeEach(() => seedSystemData());

  test("lists the catalog and manages a trainer-owned exercise", async ({
    page,
  }) => {
    await createLocalTrainerAndLogin(page);

    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.searchByName("Bieg między liniami");
    await exercises.expectExercise("Bieg między liniami", {
      trainingType: "Kondycja",
      segment: "Rozgrzewka",
    });
    await exercises.clearSearch();

    await exercises.createExercise(exercise);
    await exercises.searchByName(exercise.name);
    await exercises.expectExercise(exercise.name);

    const updatedExercise = {
      ...exercise,
      name: "Kopnięcie frontalne z tarczą",
      durationMinutes: 15,
    };
    await exercises.editExercise(exercise.name, updatedExercise);
    await exercises.searchByName(updatedExercise.name);
    await exercises.expectExercise(updatedExercise.name);

    await exercises.deactivateExercise(updatedExercise.name);
    await exercises.expectFilteredEmpty();
    await exercises.searchByName("Bieg między liniami");
    await exercises.expectExercise("Bieg między liniami", {
      trainingType: "Kondycja",
      segment: "Rozgrzewka",
    });
  });

  test("shows validation feedback for a missing required field", async ({
    page,
  }) => {
    await createLocalTrainerAndLogin(page);

    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.submitInvalidExercise();

    await exercises.expectValidationError("Nazwa ćwiczenia jest wymagana");
  });
});

test.describe("exercise search and filters", () => {
  test.beforeEach(() => seedSystemData());

  test("searches by name and filters by category", async ({ page }) => {
    await createLocalTrainerAndLogin(page);
    const exercises = new ExercisesPage(page);
    await exercises.goto();

    await exercises.createExercise(exercise, { trainingType: "Technika" });
    await exercises.createExercise(
      { ...exercise, name: "E2E kopnięcie okrężne" },
      { trainingType: "Walka" },
    );

    await exercises.searchByName("E2E");
    await exercises.expectExercise(exercise.name, { trainingType: "Technika" });
    await exercises.expectExercise("E2E kopnięcie okrężne", {
      trainingType: "Walka",
    });

    await exercises.applyCatalogFilter("Typ", "Technika");
    await exercises.expectExercise(exercise.name, { trainingType: "Technika" });
    await exercises.expectExerciseHidden("E2E kopnięcie okrężne");
    await exercises.expectActiveFilterChip("Nazwa: E2E");
    await exercises.expectActiveFilterChip("Typ: Technika");
    await exercises.expectListQuery({
      training_type_ids: /^[0-9a-f-]{36}$/i,
    });

    await exercises.clearSearch();
    await exercises.expectExerciseHidden("E2E kopnięcie okrężne");
  });

  test("shows an empty state when filters match nothing", async ({ page }) => {
    await createLocalTrainerAndLogin(page);
    const exercises = new ExercisesPage(page);
    await exercises.goto();

    await exercises.createExercise(exercise, { trainingType: "Technika" });
    await exercises.searchByName(exercise.name);
    await exercises.expectExercise(exercise.name);

    await exercises.applyCatalogFilter("Typ", "Walka");
    await exercises.expectFilteredEmpty();
    await exercises.expectExerciseHidden(exercise.name);
    await exercises.expectActiveFilterChip("Typ: Walka");
    await exercises.expectListQuery({
      training_type_ids: /^[0-9a-f-]{36}$/i,
    });
  });

  test("uses mobile buttons for rating ranges and desktop sliders after resizing", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await createLocalTrainerAndLogin(page);
    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await page.getByRole("button", { name: /Filtruj/ }).click();
    const range = exercises.filtersDialog.getByRole("group", {
      name: "Intensywność fizyczna",
      exact: true,
    });
    await range
      .getByRole("radiogroup", { name: "Od" })
      .getByText("2", { exact: true })
      .click();
    await expect(
      range
        .getByRole("radiogroup", { name: "Od" })
        .getByRole("radio", { name: "2" }),
    ).toBeChecked();
    await range
      .getByRole("radiogroup", { name: "Do" })
      .getByText("4", { exact: true })
      .click();
    await exercises.expectListQuery({
      min_physical_difficulty: /^2$/,
      max_physical_difficulty: /^4$/,
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(exercises.filtersDialog.getByRole("radiogroup")).toHaveCount(
      0,
    );
    const sliders = exercises.filtersDialog.getByRole("slider", {
      name: "Intensywność fizyczna",
      exact: true,
    });
    await expect(sliders.nth(0)).toHaveAttribute("aria-valuenow", "2");
    await expect(sliders.nth(1)).toHaveAttribute("aria-valuenow", "4");
    await exercises.filtersDialog
      .getByRole("button", { name: "Close" })
      .click();
    await exercises.expectActiveFilterChip("Intensywność fizyczna: 2–4");
    await page.reload();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: /Filtruj/ }).click();
    await expect(
      range
        .getByRole("radiogroup", { name: "Od" })
        .getByRole("radio", { name: "2" }),
    ).toBeChecked();
    await expect(
      range
        .getByRole("radiogroup", { name: "Do" })
        .getByRole("radio", { name: "4" }),
    ).toBeChecked();
    await exercises.filtersDialog
      .getByRole("button", { name: "Wyczyść" })
      .click();
    await expect(
      range
        .getByRole("radiogroup", { name: "Od" })
        .getByRole("radio", { name: "1" }),
    ).toBeChecked();
    await expect(
      range
        .getByRole("radiogroup", { name: "Do" })
        .getByRole("radio", { name: "5" }),
    ).toBeChecked();
  });
});

test.describe("exercise configuration", () => {
  test.beforeEach(() => seedSystemData());

  test("creates an exercise with type, segment, and equipment", async ({
    page,
  }) => {
    const trainer = await createLocalTrainerAndLogin(page);
    const equipment = await createEquipment(trainer, "Tarcza treningowa");

    const exercises = new ExercisesPage(page);
    await exercises.goto();

    await exercises.createExercise(exercise, {
      trainingType: "Technika",
      segment: "Rozgrzewka",
      equipment: equipment.name,
    });
    await exercises.searchByName(exercise.name);
    await exercises.expectExercise(exercise.name, {
      trainingType: "Technika",
      segment: "Rozgrzewka",
      equipment: equipment.name,
    });
  });

  test("shows validation feedback when type and segment are missing", async ({
    page,
  }) => {
    await createLocalTrainerAndLogin(page);

    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.submitExerciseWithoutAttributes(exercise);

    await exercises.openAttributeTab("Typ");
    await exercises.expectValidationError("Wybierz co najmniej jeden Typ");
    await exercises.openAttributeTab("Segment");
    await exercises.expectValidationError("Wybierz co najmniej jeden Segment");
  });

  test("keeps mobile rating fields visible after selecting every value", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await createLocalTrainerAndLogin(page);
    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.addExerciseButton.click();
    const scrollArea = exercises.exerciseDialog.locator(
      '[data-slot="scroll-area"]',
    );

    for (const label of [
      "Intensywność fizyczna",
      "Trudność techniczna",
      "Zaangażowanie górnych partii",
      "Zaangażowanie dolnych partii",
      "Zaangażowanie partii core",
    ]) {
      const group = exercises.exerciseDialog.getByRole("radiogroup", {
        name: label,
        exact: true,
      });
      for (const value of [1, 2, 3, 4, 5]) {
        const option = group.getByText(String(value), { exact: true });
        await option.click();
        await expect(
          group.getByRole("radio", { name: String(value), exact: true }),
        ).toBeChecked();
        await expect(option).toBeInViewport({ ratio: 1 });
        await expect
          .poll(() => scrollArea.evaluate((element) => element.scrollTop))
          .toBe(0);
      }
    }
  });

  test("offers mobile rating buttons and preserves values when resizing", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await createLocalTrainerAndLogin(page);

    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.addExerciseButton.click();
    const groups = exercises.exerciseDialog.getByRole("radiogroup");
    await expect(groups).toHaveCount(5);
    for (const group of await groups.all()) {
      await expect(group.getByRole("radio")).toHaveCount(5);
      for (const value of [1, 2, 3, 4, 5]) {
        await expect(
          group.getByRole("radio", { name: String(value), exact: true }),
        ).toHaveAttribute("value", String(value));
      }
      const selected = group.getByRole("radio", { name: "3", exact: true });
      await expect(selected).toBeChecked();
      await selected.focus();
      await selected.press("ArrowRight");
      await expect(group.getByRole("radio", { name: "4" })).toBeChecked();
      await expect(group.getByRole("radio", { checked: true })).toHaveCount(1);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(groups).toHaveCount(0);
    for (const label of [
      "Intensywność fizyczna",
      "Trudność techniczna",
      "Zaangażowanie górnych partii",
      "Zaangażowanie dolnych partii",
      "Zaangażowanie partii core",
    ]) {
      await expect(
        exercises.exerciseDialog.getByRole("spinbutton", { name: label }),
      ).toHaveValue("4");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(groups).toHaveCount(5);
    for (const group of await groups.all()) {
      await expect(group.getByRole("radio", { name: "4" })).toBeChecked();
    }
  });
});

test.describe("exercise details preview", () => {
  test.beforeEach(() => seedSystemData());

  test("opens the details modal with the exercise data from the list", async ({
    page,
  }) => {
    const trainer = await createLocalTrainerAndLogin(page);
    const equipment = await createEquipment(trainer, "Tarcza treningowa");
    const attributes = {
      trainingType: "Technika",
      segment: "Rozgrzewka",
      equipment: equipment.name,
    };

    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.createExercise(exercise, attributes);
    await exercises.searchByName(exercise.name);
    await exercises.expectExercise(exercise.name, attributes);

    await exercises.openDetails(exercise.name);
    await exercises.expectDetails(exercise, attributes);
  });
});

test.describe("exercise exclusion", () => {
  test.beforeEach(() => seedSystemData());

  test("excludes and reactivates an exercise on the list", async ({ page }) => {
    await createLocalTrainerAndLogin(page);
    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.createExercise(exercise);
    await exercises.searchByName(exercise.name);
    await exercises.expectExcluded(exercise.name, false);

    await exercises.setExcluded(exercise.name, true);
    await exercises.expectExcluded(exercise.name, true);

    await page.reload();
    await exercises.expectExcluded(exercise.name, true);

    await exercises.setExcluded(exercise.name, false);
    await exercises.expectExcluded(exercise.name, false);
  });

  test("does not allow deleting a catalog exercise, only excluding it", async ({
    page,
  }) => {
    await createLocalTrainerAndLogin(page);
    const exercises = new ExercisesPage(page);
    await exercises.goto();
    const catalogExercise = await exercises.firstExerciseName();
    await exercises.searchByName(catalogExercise);

    await exercises.expectNoDeleteButton(catalogExercise);
    await exercises.setExcluded(catalogExercise, true);
    await exercises.expectNoDeleteButton(catalogExercise);
    await exercises.expectExcluded(catalogExercise, true);
  });
});
