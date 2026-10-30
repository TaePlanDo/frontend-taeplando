import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Equipment } from "@/types/equipment";

import { EquipmentListItem } from "./EquipmentListItem";

const equipment: Equipment = {
  id: "0ac590e1-2a46-4cb7-8944-803e364cc46b",
  name: "Tarcza treningowa",
};

function renderItem() {
  const onEdit = vi.fn();
  const onDelete = vi.fn().mockResolvedValue(undefined);
  render(
    <EquipmentListItem
      equipment={equipment}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  );
  return { onEdit, onDelete };
}

describe("EquipmentListItem", () => {
  it("renders the equipment name and actions", () => {
    renderItem();

    expect(screen.getByRole("heading", { name: equipment.name })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edytuj" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Usuń" })).toBeTruthy();
  });

  it("calls onEdit after selecting edit", () => {
    const { onEdit } = renderItem();

    fireEvent.click(screen.getByRole("button", { name: "Edytuj" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("requires confirmation before deleting equipment", async () => {
    const { onDelete } = renderItem();

    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));

    expect(screen.getByText("Usuwanie sprzętu")).toBeTruthy();
    expect(
      screen.getByText(
        `Czy na pewno chcesz usunąć „${equipment.name}”? Sprzęt zostanie także odłączony od wszystkich ćwiczeń, w których jest używany, i przestanie być w nich widoczny. Tej operacji nie da się cofnąć.`,
      ),
    ).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledTimes(1));
  });
});
