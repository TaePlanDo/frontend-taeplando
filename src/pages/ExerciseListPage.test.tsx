import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Exercise } from "@/types/exercise";
import type { PaginatedListState } from "@/hooks/pagination/listState";
import { ExerciseListPage } from "./ExerciseListPage";
import { toast } from "sonner";

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

const setExclusion = vi.fn();
let exclusionPending = false;
vi.mock("@/hooks/exercises/useExerciseExclusion", () => ({
  useExerciseExclusion: () => ({ setExclusion, isPending: exclusionPending }),
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
  physical_difficulty: 3,
  technical_difficulty: 3,
  upper_body_load: 3,
  lower_body_load: 3,
  core_load: 3,
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
    exclusionPending = false;
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
    expect(
      screen.getByRole("textbox", { name: "Wyszukaj ćwiczenie" }),
    ).toBeTruthy();
  });
  it("shows a filtered empty view when filters are active", () => {
    state.items = [];
    state.total = 0;
    state.listState = { kind: "empty" };

    renderPage("/exercises?name=brak");

    expect(
      screen.getByText("Brak ćwiczeń spełniających wybrane filtry"),
    ).toBeTruthy();
    expect(
      screen.getByRole("textbox", { name: "Wyszukaj ćwiczenie" }),
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
    expect(
      screen.queryByRole("textbox", { name: "Wyszukaj ćwiczenie" }),
    ).toBeNull();
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
    expect(screen.getAllByText("1 ćwiczenie")).toHaveLength(2);
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

  it("shows planning attributes in the preview", async () => {
    state.items = [
      {
        ...exercise,
        physical_difficulty: 1,
        technical_difficulty: 2,
        upper_body_load: 3,
        lower_body_load: 4,
        core_load: 5,
      },
    ];
    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Pokaż szczegóły: Ap chagi" }),
    );
    const dialog = await screen.findByRole("dialog");
    for (const [label, value] of [
      ["Intensywność fizyczna", "1"],
      ["Trudność techniczna", "2"],
      ["Zaangażowanie górnych partii", "3"],
      ["Zaangażowanie dolnych partii", "4"],
      ["Zaangażowanie partii core", "5"],
    ]) {
      const block = within(dialog).getByText(label).parentElement!;
      expect(within(block).getByText(value)).toBeTruthy();
    }
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Edytuj ćwiczenie" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Edytuj ćwiczenie" }),
    ).toBeTruthy();
  });

  it("closes the exercise preview", async () => {
    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Pokaż szczegóły: Ap chagi" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Zamknij" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("updates the preview after excluding and restoring an exercise", async () => {
    setExclusion.mockResolvedValue(undefined);
    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Pokaż szczegóły: Ap chagi" }),
    );
    const toggle = screen.getByRole("switch", { name: "Wyklucz ćwiczenie" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);
    await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "true"));
    expect(setExclusion).toHaveBeenCalledWith({ id: "1", excluded: true });

    fireEvent.click(toggle);
    await waitFor(() =>
      expect(toggle).toHaveAttribute("aria-checked", "false"),
    );
    expect(setExclusion).toHaveBeenCalledWith({ id: "1", excluded: false });
  });

  it("keeps the previous state and reports an exclusion error", async () => {
    setExclusion.mockRejectedValueOnce(new Error("Ćwiczenie jest niedostępne"));
    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Pokaż szczegóły: Ap chagi" }),
    );
    const toggle = screen.getByRole("switch", { name: "Wyklucz ćwiczenie" });

    fireEvent.click(toggle);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Ćwiczenie jest niedostępne"),
    );
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("disables the switch while the exclusion request is pending", () => {
    exclusionPending = true;
    renderPage();
    fireEvent.click(
      screen.getByRole("button", { name: "Pokaż szczegóły: Ap chagi" }),
    );
    expect(
      screen.getByRole("switch", { name: "Wyklucz ćwiczenie" }),
    ).toBeDisabled();
  });
});
