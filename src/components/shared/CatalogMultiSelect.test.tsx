import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CatalogMultiSelect } from "./CatalogMultiSelect";

describe("CatalogMultiSelect", () => {
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
