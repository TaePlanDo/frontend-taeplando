import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Exercise } from "@/types/exercise";
import type { PaginatedListState } from "@/hooks/pagination/listState";
import { ExerciseListPage } from "./ExerciseListPage";

function renderPage(initialEntry = "/exercises") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ExerciseListPage />
    </MemoryRouter>,
  );
}

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/api/catalogs", () => ({
  getEquipmentRequest: vi.fn().mockResolvedValue([]),
  getTrainingTypesRequest: vi.fn().mockResolvedValue([]),
  getTrainingSegmentsRequest: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/hooks/exercises/useCreateExercise", () => ({
  useCreateExercise: () => ({
    createExercise: vi.fn(),
    isCreating: false,
    error: null,
  }),
}));
vi.mock("@/hooks/exercises/useUpdateExercise", () => ({
  useUpdateExercise: () => ({
    updateExercise: vi.fn(),
    isUpdating: false,
    error: null,
  }),
}));
vi.mock("@/hooks/exercises/useExerciseCatalogs", () => ({
  useExerciseCatalogs: () => ({
    data: { equipment: [], trainingTypes: [], segments: [] },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
vi.mock("@/hooks/exercises/useDeleteExercise", () => ({
  useDeleteExercise: () => ({
    deleteExercise: vi.fn(),
    isDeleting: false,
    error: null,
  }),
}));

const exercise: Exercise = {
  id: "1",
  owner_user_id: "owner",
  scope: "PRIVATE",
  image_url: null,
  name: "Ap chagi",
  description: "Opis",
  min_age: 7,
  max_age: 14,
  min_participants: 1,
  max_participants: 20,
  duration_minutes: 10,
  status: "ACTIVE",
  equipment: [],
  training_types: [{ id: "type", name: "Technika" }],
  segments: [{ id: 1, code: "WARMUP", name: "Rozgrzewka" }],
};
const refetch = vi.fn();
const useExercisesMock = vi.fn();
const state = {
  items: [exercise],
  page: 1,
  totalPages: 1,
  total: 1,
  isLoading: false,
  isFetching: false,
  isError: false,
  listState: { kind: "ready" } as PaginatedListState,
  refetch,
  goToPage: vi.fn(),
};
vi.mock("@/hooks/exercises/useExercises", () => ({
  useExercises: (options?: unknown) => useExercisesMock(options),
}));

describe("ExerciseListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useExercisesMock.mockImplementation(() => state);
    Object.assign(state, {
      items: [exercise],
      page: 1,
      totalPages: 1,
      total: 1,
      isLoading: false,
      isFetching: false,
      isError: false,
      listState: { kind: "ready" },
    });
  });
  it("shows the empty view", () => {
    state.items = [];
    state.total = 0;
    state.listState = { kind: "empty" };
    renderPage();
    expect(screen.getByText("Jeszcze nie masz żadnych ćwiczeń")).toBeTruthy();
  });
  it("shows a filtered empty view when filters are active", () => {
    state.items = [];
    state.total = 0;
    state.listState = { kind: "empty" };

    renderPage("/exercises?name=brak");

    expect(
      screen.getByText("Brak ćwiczeń spełniających wybrane filtry"),
    ).toBeTruthy();
  });
  it("shows an error and retries", () => {
    state.items = [];
    state.total = 0;
    state.isError = true;
    state.listState = { kind: "unavailable", reason: "error" };
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(refetch).toHaveBeenCalled();
  });
  it("shows loading instead of cards", () => {
    state.isLoading = true;
    state.listState = { kind: "loading", hasData: true };
    renderPage();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Ap chagi")).toBeNull();
  });
  it("shows cards with assigned type and segment", () => {
    renderPage();
    expect(screen.getByText("Ap chagi")).toBeTruthy();
    expect(screen.getByText("Technika")).toBeTruthy();
    expect(screen.getByText("Rozgrzewka")).toBeTruthy();
  });
  it("passes URL filters and page into useExercises", () => {
    renderPage(
      "/exercises?name=chagi&equipment_ids=8f20d653-dc8b-4b76-bdb4-b225c7d420a6&page=2",
    );

    expect(useExercisesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          name: "chagi",
          equipment_ids: ["8f20d653-dc8b-4b76-bdb4-b225c7d420a6"],
        },
        page: 2,
      }),
    );
  });
  it("opens create and prefilled edit dialogs", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /Dodaj ćwiczenie/ }));
    expect(
      await screen.findByRole("heading", { name: "Stwórz ćwiczenie" }),
    ).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Edytuj" }));
    expect(
      await screen.findByRole("heading", { name: "Edytuj ćwiczenie" }),
    ).toBeTruthy();
    expect(
      (screen.getByLabelText("Nazwa ćwiczenia") as HTMLInputElement).value,
    ).toBe("Ap chagi");
  });

  it("does not offer editing from a global exercise preview", async () => {
    state.items = [{ ...exercise, scope: "GLOBAL" }];
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: "Pokaż szczegóły: Ap chagi" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Podgląd ćwiczenia" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Edytuj ćwiczenie" }),
    ).toBeNull();
  });
});
