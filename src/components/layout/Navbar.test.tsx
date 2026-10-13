import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { Navbar } from "./Navbar";
import { NAV_ITEMS } from "./navItems";

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  it("renders the brand link", () => {
    renderNavbar();

    expect(
      screen.getByRole("link", { name: "TaePlanDo - strona główna" }),
    ).toBeTruthy();
  });

  it("renders every nav item as a desktop link", () => {
    renderNavbar();

    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.label })).toBeTruthy();
    }
  });

  it("renders the mobile menu trigger", () => {
    renderNavbar();

    expect(
      screen.getByRole("button", { name: "Otwórz menu nawigacji" }),
    ).toBeTruthy();
  });

  it("opens the mobile menu with every nav item", async () => {
    renderNavbar();

    fireEvent.keyDown(
      screen.getByRole("button", { name: "Otwórz menu nawigacji" }),
      { key: "Enter" },
    );

    await waitFor(() => {
      expect(screen.getAllByRole("menuitem")).toHaveLength(NAV_ITEMS.length);
    });
  });
});
