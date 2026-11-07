import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DualRangeField } from "./DualRangeField";
import { SingleRangeField } from "./SingleRangeField";

describe("SingleRangeField", () => {
  it("renders one accessible thumb and supports keyboard changes within bounds", () => {
    const onChange = vi.fn();
    render(
      <SingleRangeField
        label="Liczba uczestników"
        min={1}
        max={50}
        value={20}
        onValueChange={onChange}
        formatValue={(value) => `${value} osób`}
      />,
    );
    const slider = screen.getByRole("slider", { name: "Liczba uczestników" });
    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(slider).toHaveAttribute("aria-valuenow", "20");
    expect(slider).toHaveAttribute("aria-valuetext", "20 osób");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(21);
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(slider, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it("prevents changes while disabled and exposes the field error", () => {
    const onChange = vi.fn();
    render(
      <SingleRangeField
        label="Liczba uczestników"
        min={1}
        max={50}
        value={20}
        onValueChange={onChange}
        disabled
        error="Sprawdź liczbę uczestników"
      />,
    );
    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
    expect(slider).toHaveAccessibleDescription("Sprawdź liczbę uczestników");
    expect(slider).toHaveAttribute("aria-invalid", "true");
  });

  it("preserves both thumbs for existing range fields", () => {
    render(
      <DualRangeField
        label="Wiek"
        min={1}
        max={99}
        value={[10, 30]}
        onValueChange={vi.fn()}
      />,
    );
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "10");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "30");
  });
});
