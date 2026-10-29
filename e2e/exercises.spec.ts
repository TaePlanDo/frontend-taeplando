import { seedSystemData } from "./helpers/backend";
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
