import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { HomePage } from "@/pages/HomePage";

describe("HomePage", () => {
  it("renders the hero heading", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Zaplanuj sztuki walki");
    expect(heading.textContent).toContain("TaePlanDo");
  });

  it("renders the call-to-action button", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Generuj plan" })).toHaveAttribute(
      "href",
      "/plans/new",
    );
  });
});
