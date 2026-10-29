import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Group } from "@/types/group";
import type { PaginatedListState } from "@/hooks/pagination/listState";

import { GroupListPage } from "./GroupListPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mainSchema = [
  {
    segment_id: 3,
    segment_code: "MAIN",
    segment_name: "Część główna",
    percentage: 100,
    position: 1,
  },
];

const groups: Group[] = [
  {
    id: "1",
    name: "Młodzież",
    min_age: 7,
    max_age: 14,
    duration_minutes: 90,
    created_at: "2026-10-11T12:00:00Z",
    updated_at: "2026-10-11T12:00:00Z",
    schema: mainSchema,
  },
  {
    id: "2",
    name: "Seniorzy",
    min_age: 60,
    max_age: 80,
    duration_minutes: 45,
    created_at: "2026-10-11T12:00:00Z",
    updated_at: "2026-10-11T12:00:00Z",
    schema: mainSchema,
  },
];

const refetch = vi.fn();

const groupsState = {
  items: groups,
  page: 1,
  totalPages: 1,
  total: groups.length,
  isLoading: false,
  isFetching: false,
  isError: false,
  listState: { kind: "ready" } as PaginatedListState,
  refetch,
  goToPage: vi.fn(),
};

vi.mock("@/hooks/groups/useGroups", () => ({
  useGroups: () => groupsState,
}));

const createGroup = vi.fn();
const updateGroup = vi.fn();

vi.mock("@/hooks/groups/useCreateGroup", () => ({
  useCreateGroup: () => ({ createGroup, isCreating: false, error: null }),
}));

vi.mock("@/hooks/groups/useUpdateGroup", () => ({
  useUpdateGroup: () => ({ updateGroup, isUpdating: false, error: null }),
}));

vi.mock("@/hooks/groups/useDeleteGroup", () => ({
  useDeleteGroup: () => ({
    deleteGroup: vi.fn(),
    isDeleting: false,
    error: null,
  }),
}));

const updateGroupSchema = vi.fn();

vi.mock("@/hooks/groups/useUpdateGroupSchema", () => ({
  useUpdateGroupSchema: () => ({
    updateGroupSchema,
    isUpdating: false,
    error: null,
  }),
}));

vi.mock("@/hooks/groups/useTrainingSegments", () => ({
  useTrainingSegments: () => ({
    segments: [
      { id: 1, code: "WARMUP", name: "Rozgrzewka" },
      { id: 3, code: "MAIN", name: "Część główna" },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

function input(label: string) {
  return screen.getByLabelText(label) as HTMLInputElement;
}

describe("GroupListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    groupsState.items = groups;
    groupsState.page = 1;
    groupsState.totalPages = 1;
    groupsState.total = groups.length;
    groupsState.isLoading = false;
    groupsState.isFetching = false;
    groupsState.isError = false;
    groupsState.listState = { kind: "ready" };
  });

  it("shows the empty view when there are no groups", () => {
    groupsState.items = [];
    groupsState.total = 0;
    groupsState.listState = { kind: "empty" };
    render(<GroupListPage />);

    expect(screen.getByText("Jeszcze nie masz żadnych grup")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error with retry instead of the empty view when loading failed", () => {
    groupsState.items = [];
    groupsState.total = 0;
    groupsState.isError = true;
    groupsState.listState = { kind: "unavailable", reason: "error" };
    render(<GroupListPage />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Nie udało się pobrać grup")).toBeTruthy();
    expect(screen.queryByText("Jeszcze nie masz żadnych grup")).toBeNull();
    expect(screen.queryByText("Młodzież")).toBeNull();
  });

  it("retries loading from the error view and disables the button while retrying", () => {
    groupsState.items = [];
    groupsState.isError = true;
    groupsState.listState = { kind: "unavailable", reason: "error" };
    const { rerender } = render(<GroupListPage />);

    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(refetch).toHaveBeenCalledTimes(1);

    groupsState.isFetching = true;
    rerender(<GroupListPage />);

    const retrying = screen.getByRole("button", {
      name: "Ponawianie…",
    }) as HTMLButtonElement;
    expect(retrying.disabled).toBe(true);
  });

  it("does not show the pager or the group count as a valid list on error", () => {
    groupsState.items = [];
    groupsState.isError = true;
    groupsState.listState = { kind: "unavailable", reason: "error" };
    groupsState.totalPages = 3;
    render(<GroupListPage />);

    expect(screen.queryByRole("navigation", { name: "Paginacja" })).toBeNull();
  });

  it("does not show the previous page's cards as the selected page while loading", () => {
    groupsState.page = 2;
    groupsState.totalPages = 3;
    groupsState.isLoading = true;
    groupsState.isFetching = true;
    groupsState.listState = { kind: "loading", hasData: true };
    render(<GroupListPage />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Młodzież")).toBeNull();
    expect(screen.queryByText("Seniorzy")).toBeNull();
    expect(screen.queryByText("Jeszcze nie masz żadnych grup")).toBeNull();
  });

  it("keeps the pager visible with the selected page while the page loads", () => {
    groupsState.page = 2;
    groupsState.totalPages = 3;
    groupsState.isLoading = true;
    groupsState.listState = { kind: "loading", hasData: true };
    render(<GroupListPage />);

    const current = screen.getByRole("link", { current: "page" });
    expect(current.textContent).toBe("2");
  });

  it("shows the cards and the pager once the selected page is loaded", () => {
    groupsState.page = 2;
    groupsState.totalPages = 3;
    render(<GroupListPage />);

    expect(screen.getByText("Młodzież")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("link", { current: "page" }).textContent).toBe("2");
  });

  it("opens an empty create dialog after clicking Dodaj grupę", () => {
    render(<GroupListPage />);

    fireEvent.click(screen.getByRole("button", { name: /Dodaj grupę/ }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Stwórz Grupę treningową")).toBeTruthy();
    expect(input("Nazwa Grupy").value).toBe("");
    expect(screen.getByRole("button", { name: "Utwórz" })).toBeTruthy();
  });

  it("opens a prefilled edit dialog for the clicked group", () => {
    render(<GroupListPage />);

    fireEvent.click(screen.getAllByRole("button", { name: /Edytuj/ })[1]);

    expect(screen.getByText("Edytuj Grupę treningową")).toBeTruthy();
    expect(input("Nazwa Grupy").value).toBe("Seniorzy");
    expect(input("Minimalny").value).toBe("60");
    expect(input("Maksymalny").value).toBe("80");
    expect(input("Godziny").value).toBe("0");
    expect(input("Minuty").value).toBe("45");
    expect(screen.getByRole("button", { name: "Zapisz zmiany" })).toBeTruthy();
  });

  it("opens the schema dialog for the clicked group", async () => {
    render(<GroupListPage />);

    fireEvent.click(screen.getAllByRole("button", { name: /Schemat/ })[0]);

    expect(screen.getByText("Schemat: Młodzież")).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Schemat treningu" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zapisz schemat" })).toBeTruthy();
  });

  it("opens an empty form after editing and then clicking Dodaj grupę", async () => {
    render(<GroupListPage />);

    fireEvent.click(screen.getAllByRole("button", { name: /Edytuj/ })[0]);
    expect(input("Nazwa Grupy").value).toBe("Młodzież");

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: /Dodaj grupę/ }));

    expect(screen.getByText("Stwórz Grupę treningową")).toBeTruthy();
    expect(input("Nazwa Grupy").value).toBe("");
  });

  it("closes the dialog after a successful update", async () => {
    updateGroup.mockResolvedValue(undefined);
    render(<GroupListPage />);

    fireEvent.click(screen.getAllByRole("button", { name: /Edytuj/ })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    await waitFor(() => {
      expect(updateGroup).toHaveBeenCalledWith("1", {
        name: "Młodzież",
        min_age: 7,
        max_age: 14,
        duration_minutes: 90,
      });
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
