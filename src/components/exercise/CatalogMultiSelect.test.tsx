import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CatalogMultiSelect } from "./CatalogMultiSelect";

describe("CatalogMultiSelect", () => {
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
