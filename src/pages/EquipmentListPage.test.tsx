import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Equipment } from "@/types/equipment";

import { EquipmentListPage } from "./EquipmentListPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const equipment: Equipment[] = [
  { id: "1", name: "Tarcza treningowa" },
  { id: "2", name: "Łapy trenerskie" },
];

const refetch = vi.fn();
const goToPage = vi.fn();
const equipmentState = {
  items: equipment,
  page: 1,
  totalPages: 1,
  total: equipment.length,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch,
  goToPage,
};

vi.mock("@/hooks/equipment/useEquipment", () => ({
  useEquipment: () => equipmentState,
}));

const createEquipment = vi.fn();
const updateEquipment = vi.fn();
const deleteEquipment = vi.fn();

vi.mock("@/hooks/equipment/useCreateEquipment", () => ({
  useCreateEquipment: () => ({
    createEquipment,
    isCreating: false,
    error: null,
  }),
}));

vi.mock("@/hooks/equipment/useUpdateEquipment", () => ({
  useUpdateEquipment: () => ({
    updateEquipment,
    isUpdating: false,
    error: null,
  }),
}));

vi.mock("@/hooks/equipment/useDeleteEquipment", () => ({
  useDeleteEquipment: () => ({
    deleteEquipment,
    isDeleting: false,
    error: null,
  }),
}));

function input() {
  return screen.getByLabelText("Nazwa") as HTMLInputElement;
}

describe("EquipmentListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    equipmentState.items = equipment;
    equipmentState.page = 1;
    equipmentState.totalPages = 1;
    equipmentState.total = equipment.length;
    equipmentState.isLoading = false;
    equipmentState.isFetching = false;
    equipmentState.isError = false;
  });

  it("shows the empty view when there is no equipment", () => {
    equipmentState.items = [];
    equipmentState.total = 0;

    render(<EquipmentListPage />);

    expect(screen.getByText("Jeszcze nie masz żadnego sprzętu")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error and retries loading", () => {
    equipmentState.items = [];
    equipmentState.isError = true;

    render(<EquipmentListPage />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Nie udało się pobrać sprzętu")).toBeTruthy();
    expect(screen.queryByText("Jeszcze nie masz żadnego sprzętu")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("shows a loading state instead of stale equipment", () => {
    equipmentState.isLoading = true;

    render(<EquipmentListPage />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Tarcza treningowa")).toBeNull();
  });

  it("renders equipment and pagination", () => {
    equipmentState.page = 2;
    equipmentState.totalPages = 3;

    render(<EquipmentListPage />);

    expect(screen.getByText("Tarcza treningowa")).toBeTruthy();
    expect(screen.getByText("Łapy trenerskie")).toBeTruthy();
    expect(screen.getByRole("link", { current: "page" }).textContent).toBe("2");
  });

  it("opens an empty create dialog", () => {
    render(<EquipmentListPage />);

    fireEvent.click(screen.getByRole("button", { name: "Dodaj sprzęt" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Dodaj sprzęt" })).toBeTruthy();
    expect(input().value).toBe("");
  });

  it("opens a prefilled edit dialog", () => {
    render(<EquipmentListPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "Edytuj" })[1]);

    expect(screen.getByRole("heading", { name: "Edytuj sprzęt" })).toBeTruthy();
    expect(input().value).toBe("Łapy trenerskie");
  });

  it("deletes the selected equipment after confirmation", async () => {
    deleteEquipment.mockResolvedValue(undefined);
    render(<EquipmentListPage />);

    fireEvent.click(screen.getAllByRole("button", { name: "Usuń" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));

    await waitFor(() => expect(deleteEquipment).toHaveBeenCalledWith("1"));
  });
});
