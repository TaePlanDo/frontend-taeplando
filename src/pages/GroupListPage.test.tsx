import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Group } from "@/types/group";

import { GroupListPage } from "./GroupListPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const groups: Group[] = [
  {
    id: "1",
    name: "Młodzież",
    min_age: 7,
    max_age: 14,
    duration_minutes: 90,
    created_at: new Date("2026-10-11T12:00:00Z"),
    updated_at: new Date("2026-10-11T12:00:00Z"),
  },
  {
    id: "2",
    name: "Seniorzy",
    min_age: 60,
    max_age: 80,
    duration_minutes: 45,
    created_at: new Date("2026-10-11T12:00:00Z"),
    updated_at: new Date("2026-10-11T12:00:00Z"),
  },
];

const groupsState = {
  items: groups,
  page: 1,
  totalPages: 1,
  total: groups.length,
  isLoading: false,
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

function input(label: string) {
  return screen.getByLabelText(label) as HTMLInputElement;
}

describe("GroupListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    groupsState.items = groups;
    groupsState.total = groups.length;
    groupsState.isLoading = false;
  });

  it("shows the empty view when there are no groups", () => {
    groupsState.items = [];
    groupsState.total = 0;
    render(<GroupListPage />);

    expect(screen.getByText("Jeszcze nie masz żadnych grup")).toBeTruthy();
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
