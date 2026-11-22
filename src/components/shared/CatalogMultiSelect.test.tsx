import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CatalogMultiSelect } from "./CatalogMultiSelect";

describe("CatalogMultiSelect", () => {
  it("keeps the list open, marks selections and permits deselecting every item", async () => {
    function Form() {
      const [selected, setSelected] = useState<string[]>([]);
      return (
        <CatalogMultiSelect
          label="Sprzęt"
          items={[
            { id: "1", name: "Tarcze" },
            { id: "2", name: "Piłka" },
          ]}
          selectedIds={selected}
          onSelectedIdsChange={setSelected}
        />
      );
    }
    render(<Form />);
    const trigger = screen.getByRole("combobox", { name: "Sprzęt" });
    fireEvent.click(trigger);
    const list = screen.getByRole("listbox", { name: "Sprzęt" });
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    fireEvent.click(within(list).getByRole("option", { name: "Tarcze" }));
    fireEvent.click(within(list).getByRole("option", { name: "Piłka" }));
    expect(
      within(list).getByRole("option", { name: "Tarcze" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(within(list).getByRole("option", { name: "Piłka" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(within(list).getByRole("option", { name: "Tarcze" }));
    expect(
      within(list).getByRole("option", { name: "Tarcze" }),
    ).toHaveAttribute("aria-selected", "false");
    fireEvent.keyDown(within(list).getByRole("option", { name: "Tarcze" }), {
      key: "End",
    });
    await waitFor(() =>
      expect(within(list).getByRole("option", { name: "Piłka" })).toHaveFocus(),
    );
    fireEvent.click(within(list).getByRole("option", { name: "Piłka" }));
    expect(within(list).getByRole("option", { name: "Piłka" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(list, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it.each([
    { disabled: true },
    { isLoading: true },
    { unavailableMessage: "Brak połączenia" },
    { items: [] },
  ])(
    "does not reopen after the catalog becomes available again: %j",
    (unavailable) => {
      const props = {
        label: "Sprzęt",
        items: [{ id: "1", name: "Tarcze" }],
        selectedIds: [],
        onSelectedIdsChange: vi.fn(),
      };
      const { rerender } = render(<CatalogMultiSelect {...props} />);
      fireEvent.click(screen.getByRole("combobox", { name: "Sprzęt" }));
      expect(screen.getByRole("listbox")).toBeVisible();
      rerender(<CatalogMultiSelect {...props} {...unavailable} />);
      expect(screen.queryByRole("listbox")).toBeNull();
      rerender(<CatalogMultiSelect {...props} />);
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(screen.getByRole("combobox", { name: "Sprzęt" })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    },
  );
  it("disables selection and removal while disabled", () => {
    const onChange = vi.fn();
    render(
      <CatalogMultiSelect
        label="Sprzęt"
        items={[
          { id: "1", name: "Tarcze" },
          { id: "2", name: "Piłka" },
        ]}
        selectedIds={["1"]}
        onSelectedIdsChange={onChange}
        disabled
      />,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
    const remove = screen.getByRole("button", { name: "Usuń Tarcze" });
    expect(
      screen.getByRole("combobox").compareDocumentPosition(remove) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(remove).toBeDisabled();
    fireEvent.click(remove);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("associates the validation message with the select", () => {
    render(
      <CatalogMultiSelect
        label="Sprzęt"
        items={[]}
        selectedIds={[]}
        onSelectedIdsChange={vi.fn()}
        error="Sprawdź wybór sprzętu"
      />,
    );
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription(
      "Sprawdź wybór sprzętu",
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
  it("keeps an unavailable selected id visible and removable", () => {
    const onSelectedIdsChange = vi.fn();
    render(
      <CatalogMultiSelect
        label="Sprzęt"
        items={[]}
        selectedIds={["removed-id"]}
        onSelectedIdsChange={onSelectedIdsChange}
      />,
    );

    const unavailable = "Niedostępny element (removed-id)";
    expect(screen.getByText(unavailable)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: `Usuń ${unavailable}` }),
    );
    expect(onSelectedIdsChange).toHaveBeenCalledWith([]);
  });
});
