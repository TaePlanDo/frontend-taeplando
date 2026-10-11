import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AuthorizedLayout } from "./AuthorizedLayout";

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<AuthorizedLayout />}>
          <Route path="/" element={<p>landing content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthorizedLayout", () => {
  it("renders the navbar and the routed content", () => {
    renderLayout();

    expect(
      screen.getByRole("link", { name: "TaePlanDo - strona główna" }),
    ).toBeTruthy();
    expect(screen.getByText("landing content")).toBeTruthy();
  });
});
