import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePage } from "@/pages/HomePage";

describe("HomePage", () => {
  it("renders the hero heading", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Zaplanuj sztuki walki");
    expect(heading.textContent).toContain("TaePlanDo");
  });

  it("renders the call-to-action button", () => {
    render(<HomePage />);

    expect(screen.getByRole("button", { name: "Generuj plan" })).toBeTruthy();
  });
});
