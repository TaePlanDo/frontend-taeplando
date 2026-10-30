import { seedSystemData } from "./helpers/backend";
import { createEquipment } from "./helpers/createEquipment";
import { createLocalTrainerAndLogin } from "./helpers/createLocalTrainer";
import { ExercisesPage } from "./pages/exercises.page";
import { test } from "./playwright";

const exercise = {
  name: "Kopnięcie frontalne",
  description: "Ćwiczenie kopnięcia frontalnego na komendę.",
  minAge: 7,
  maxAge: 14,
  minParticipants: 2,
  maxParticipants: 16,
  durationMinutes: 10,
};

test.describe("exercise management", () => {
  test.beforeEach(() => seedSystemData());

  test("lists the catalog and manages a trainer-owned exercise", async ({
    page,
  }) => {
    await createLocalTrainerAndLogin(page);

    const exercises = new ExercisesPage(page);
    await exercises.goto();
    await exercises.expectNoExercises();

    await exercises.createExercise(exercise);
    await exercises.expectExercise(exercise.name);

    const updatedExercise = {
      ...exercise,
      name: "Kopnięcie frontalne z tarczą",
      durationMinutes: 15,
    };
    await exercises.editExercise(exercise.name, updatedExercise);
    await exercises.expectExercise(updatedExercise.name);

    await exercises.deactivateExercise(updatedExercise.name);
    await exercises.expectNoExercises();
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
      { ...exercise, name: "Kopnięcie okrężne" },
      { trainingType: "Poomsae" },
    );

    await exercises.searchByName("Kopnięcie");
    await exercises.expectExercise(exercise.name, { trainingType: "Technika" });
    await exercises.expectExercise("Kopnięcie okrężne", {
      trainingType: "Poomsae",
    });

    await exercises.applyCatalogFilter("Kategorie", "Technika");
    await exercises.expectExercise(exercise.name, { trainingType: "Technika" });
    await exercises.expectExerciseHidden("Kopnięcie okrężne");
    await exercises.expectActiveFilterChip("Nazwa: Kopnięcie");
    await exercises.expectActiveFilterChip("Kategorie: Technika");
    await exercises.expectListQuery({
      training_type_ids: /^[0-9a-f-]{36}$/i,
    });

    await exercises.clearSearch();
    await exercises.expectExercise(exercise.name);
    await exercises.expectExerciseHidden("Kopnięcie okrężne");
  });

  test("shows an empty state when filters match nothing", async ({ page }) => {
    await createLocalTrainerAndLogin(page);
    const exercises = new ExercisesPage(page);
    await exercises.goto();

    await exercises.createExercise(exercise, { trainingType: "Technika" });
    await exercises.expectExercise(exercise.name);

    await exercises.applyCatalogFilter("Kategorie", "Poomsae");
    await exercises.expectFilteredEmpty();
    await exercises.expectExerciseHidden(exercise.name);
    await exercises.expectActiveFilterChip("Kategorie: Poomsae");
    await exercises.expectListQuery({
      training_type_ids: /^[0-9a-f-]{36}$/i,
    });
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
    await exercises.expectExercise(exercise.name, attributes);

    await exercises.openDetails(exercise.name);
    await exercises.expectDetails(exercise, attributes);
  });
});
