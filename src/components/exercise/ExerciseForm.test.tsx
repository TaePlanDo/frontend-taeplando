import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseForm } from "./ExerciseForm";
import type { Exercise } from "@/types/exercise";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const createExercise = vi.fn();
const updateExercise = vi.fn();

vi.mock("@/hooks/exercises/useCreateExercise", () => ({
  useCreateExercise: () => ({ createExercise, isCreating: false, error: null }),
}));
vi.mock("@/hooks/exercises/useUpdateExercise", () => ({
  useUpdateExercise: () => ({ updateExercise, isUpdating: false, error: null }),
}));
vi.mock("@/hooks/exercises/useExerciseCatalogs", () => ({
  useExerciseCatalogs: () => ({
    data: {
      equipment: [{ id: "e1", name: "Tarcza" }],
      trainingTypes: [{ id: "t1", name: "Technika" }],
      segments: [{ id: 1, code: "WARMUP", name: "Rozgrzewka" }],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/lib/api/catalogs", () => ({
  getEquipmentRequest: vi
    .fn()
    .mockResolvedValue([{ id: "e1", name: "Tarcza" }]),
  getTrainingTypesRequest: vi
    .fn()
    .mockResolvedValue([{ id: "t1", name: "Technika" }]),
  getTrainingSegmentsRequest: vi
    .fn()
    .mockResolvedValue([{ id: 1, code: "WARMUP", name: "Rozgrzewka" }]),
}));

function renderForm() {
  const onClose = vi.fn();
  render(<ExerciseForm onClose={onClose} />);
  return { onClose };
}

async function addFromList(tabLabel: string, optionLabel: string) {
  const tab = screen.getByRole("tab", { name: new RegExp(tabLabel) });
  fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
  fireEvent.click(
    await screen.findByLabelText(`Dodaj ${tabLabel.toLowerCase()}`),
  );
  fireEvent.click(await screen.findByRole("option", { name: optionLabel }));
}

describe("ExerciseForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders an empty create form and required attribute warnings", async () => {
    renderForm();
    expect(
      (screen.getByLabelText("Nazwa ćwiczenia") as HTMLInputElement).value,
    ).toBe("");
    expect(screen.getByLabelText("Brak wybranego: Typ")).toBeTruthy();
    expect(screen.getByLabelText("Brak wybranego: Segment")).toBeTruthy();
  });

  it("shows field errors and does not submit an incomplete form", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Stwórz ćwiczenie" }));
    expect(
      await screen.findByText("Nazwa ćwiczenia jest wymagana"),
    ).toBeTruthy();
    expect(screen.getByText("Opis ćwiczenia jest wymagany")).toBeTruthy();
    expect(createExercise).not.toHaveBeenCalled();
  });

  it("creates an exercise after selecting the required Type and Segment", async () => {
    const { onClose } = renderForm();
    fireEvent.change(screen.getByLabelText("Nazwa ćwiczenia"), {
      target: { value: "Borek" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Opisz ćwiczenie, zasady, wariant..."),
      { target: { value: "Opis" } },
    );
    fireEvent.change(screen.getByLabelText("Czas trwania w minutach"), {
      target: { value: "10" },
    });
    await addFromList("Typ", "Technika");
    await addFromList("Segment", "Rozgrzewka");
    createExercise.mockResolvedValueOnce({});
    fireEvent.click(screen.getByRole("button", { name: "Stwórz ćwiczenie" }));
    await waitFor(() =>
      expect(createExercise).toHaveBeenCalledWith(
        expect.objectContaining({
          min_age: 1,
          max_age: 99,
          min_participants: 1,
          max_participants: 99,
          physical_difficulty: 3,
          technical_difficulty: 3,
          upper_body_load: 3,
          lower_body_load: 3,
          core_load: 3,
        }),
      ),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("renders edit values and sends an update", async () => {
    const exercise: Exercise = {
      id: "1",
      owner_user_id: "owner",
      scope: "PRIVATE",
      image_url: "https://example.com/image.png",
      name: "Ap chagi",
      description: "Opis",
      min_age: 7,
      max_age: 14,
      min_participants: 1,
      max_participants: 20,
      duration_minutes: 10,
      physical_difficulty: 2,
      technical_difficulty: 4,
      upper_body_load: 1,
      lower_body_load: 5,
      core_load: 3,
      status: "ACTIVE",
      equipment: [],
      training_types: [{ id: "t1", name: "Technika" }],
      segments: [{ id: 1, code: "WARMUP", name: "Rozgrzewka" }],
    };
    render(<ExerciseForm exercise={exercise} onClose={vi.fn()} />);
    expect(
      (screen.getByLabelText("Nazwa ćwiczenia") as HTMLInputElement).value,
    ).toBe("Ap chagi");
    updateExercise.mockResolvedValueOnce({});
    fireEvent.click(screen.getByRole("button", { name: "Edytuj ćwiczenie" }));
    await waitFor(() =>
      expect(updateExercise).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          payload: expect.objectContaining({
            image_url: exercise.image_url,
            physical_difficulty: 2,
            technical_difficulty: 4,
            upper_body_load: 1,
            lower_body_load: 5,
            core_load: 3,
          }),
        }),
      ),
    );
  });

  it("rejects planning values outside the allowed range", async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Intensywność fizyczna"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Stwórz ćwiczenie" }));
    expect(
      await screen.findByText("Intensywność fizyczna musi być w zakresie 1–5"),
    ).toBeTruthy();
    expect(createExercise).not.toHaveBeenCalled();
  });
});
