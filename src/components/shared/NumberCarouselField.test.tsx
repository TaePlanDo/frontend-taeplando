import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NumberCarouselField } from "./NumberCarouselField";

function Carousel({ initialValue = 90 }: { initialValue?: number }) {
  const [value, setValue] = useState(initialValue);
  return (
    <NumberCarouselField
      label="Czas"
      min={0}
      max={779}
      step={5}
      value={value}
      onValueChange={setValue}
    />
  );
}

describe("NumberCarouselField", () => {
  it("uses five-minute steps and respects the last selectable value", () => {
    render(<Carousel />);
    const field = screen.getByRole("spinbutton", { name: "Czas" });
    fireEvent.keyDown(field, { key: "ArrowRight" });
    expect(field).toHaveAttribute("aria-valuenow", "95");
    fireEvent.keyDown(field, { key: "ArrowLeft" });
    expect(field).toHaveAttribute("aria-valuenow", "90");
    fireEvent.keyDown(field, { key: "End" });
    expect(field).toHaveAttribute("aria-valuenow", "775");
    fireEvent.keyDown(field, { key: "ArrowRight" });
    expect(field).toHaveAttribute("aria-valuenow", "775");
  });

  it("preserves a saved off-step duration until the user changes it", () => {
    render(<Carousel initialValue={93} />);
    const field = screen.getByRole("spinbutton", { name: "Czas" });
    expect(field).toHaveAttribute("aria-valuenow", "93");
    fireEvent.keyDown(field, { key: "ArrowRight" });
    expect(field).toHaveAttribute("aria-valuenow", "95");
    fireEvent.keyDown(field, { key: "ArrowLeft" });
    expect(field).toHaveAttribute("aria-valuenow", "90");
  });

  it("blocks keyboard changes while disabled and exposes validation errors", () => {
    const onChange = vi.fn();
    render(
      <NumberCarouselField
        label="Czas"
        min={0}
        max={100}
        step={5}
        value={0}
        onValueChange={onChange}
        disabled
        error="Wybierz czas"
      />,
    );
    const field = screen.getByRole("spinbutton", { name: "Czas" });
    fireEvent.keyDown(field, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveAccessibleDescription(/Wybierz czas/);
    expect(field).toHaveAttribute("aria-disabled", "true");
  });
});
