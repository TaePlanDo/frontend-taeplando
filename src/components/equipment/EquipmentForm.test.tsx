import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import type { Equipment } from "@/types/equipment";

import { EquipmentForm } from "./EquipmentForm";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

const createEquipment = vi.fn();
const updateEquipment = vi.fn();

const createState = {
  createEquipment,
  isCreating: false,
  error: null as string | null,
};

const updateState = {
  updateEquipment,
  isUpdating: false,
  error: null as string | null,
};

vi.mock("@/hooks/equipment/useCreateEquipment", () => ({
  useCreateEquipment: () => createState,
}));

vi.mock("@/hooks/equipment/useUpdateEquipment", () => ({
  useUpdateEquipment: () => updateState,
}));

const equipment: Equipment = {
  id: "0ac590e1-2a46-4cb7-8944-803e364cc46b",
  name: "Tarcza treningowa",
};

function renderForm(item: Equipment | null = null) {
  const onClose = vi.fn();
  render(<EquipmentForm equipment={item} onClose={onClose} />);
  return { onClose };
}

function input() {
  return screen.getByLabelText("Nazwa") as HTMLInputElement;
}

describe("EquipmentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createEquipment.mockReset();
    updateEquipment.mockReset();
    createState.isCreating = false;
    createState.error = null;
    updateState.isUpdating = false;
    updateState.error = null;
  });

  it("renders an empty create form", () => {
    renderForm();

    expect(input().value).toBe("");
    expect(input().placeholder).toBe("Znaczniki");
    expect(screen.getByRole("button", { name: "Dodaj sprzęt" })).toBeTruthy();
  });

  it("shows validation errors without calling the API", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Dodaj sprzęt" }));

    expect(await screen.findByText("Nazwa sprzętu jest wymagana")).toBeTruthy();
    expect(createEquipment).not.toHaveBeenCalled();
  });

  it("creates equipment, shows a toast and closes the dialog", async () => {
    createEquipment.mockResolvedValue(undefined);
    const { onClose } = renderForm();

    fireEvent.change(input(), { target: { value: "  Tarcza treningowa  " } });
    fireEvent.click(screen.getByRole("button", { name: "Dodaj sprzęt" }));

    await waitFor(() => {
      expect(createEquipment).toHaveBeenCalledWith({
        name: "Tarcza treningowa",
      });
      expect(toast.success).toHaveBeenCalledWith("Sprzęt został utworzony");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(updateEquipment).not.toHaveBeenCalled();
  });

  it("keeps the dialog open and shows the create error after a failed request", async () => {
    createEquipment.mockRejectedValue(new Error("fail"));
    createState.error = "Nie udało się utworzyć sprzętu. Spróbuj ponownie.";
    const { onClose } = renderForm();

    fireEvent.change(input(), { target: { value: "Tarcza" } });
    fireEvent.click(screen.getByRole("button", { name: "Dodaj sprzęt" }));

    await waitFor(() => expect(createEquipment).toHaveBeenCalled());

    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(
      screen.getByText("Nie udało się utworzyć sprzętu. Spróbuj ponownie."),
    ).toBeTruthy();
  });

  it("prefills the form when editing equipment", () => {
    renderForm(equipment);

    expect(input().value).toBe("Tarcza treningowa");
    expect(screen.getByRole("button", { name: "Edytuj sprzęt" })).toBeTruthy();
  });

  it("updates equipment, shows a toast and closes the dialog", async () => {
    updateEquipment.mockResolvedValue(undefined);
    const { onClose } = renderForm(equipment);

    fireEvent.change(input(), { target: { value: "Łapy trenerskie" } });
    fireEvent.click(screen.getByRole("button", { name: "Edytuj sprzęt" }));

    await waitFor(() => {
      expect(updateEquipment).toHaveBeenCalledWith(equipment.id, {
        name: "Łapy trenerskie",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Sprzęt został zaktualizowany",
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(createEquipment).not.toHaveBeenCalled();
  });

  it("shows only the update error in edit mode", () => {
    createState.error = "Błąd tworzenia";
    updateState.error = "Sprzęt nie istnieje";

    renderForm(equipment);

    expect(screen.getByText("Sprzęt nie istnieje")).toBeTruthy();
    expect(screen.queryByText("Błąd tworzenia")).toBeNull();
  });

  it("disables the input and submit button while saving", () => {
    createState.isCreating = true;
    renderForm();

    expect(input()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Dodaj sprzęt" })).toBeDisabled();
  });
});
