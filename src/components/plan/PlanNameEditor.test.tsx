import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PlanNameEditor } from "./PlanNameEditor";

describe("PlanNameEditor", () => {
  it.each(["Plan treningowy", "Edytuj nazwę planu"])(
    "starts editing using %s and saves trimmed name once on Enter",
    (trigger) => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(
        <PlanNameEditor
          name="Plan treningowy"
          disabled={false}
          onSave={onSave}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: trigger }));
      const input = screen.getByRole("textbox", { name: "Nazwa planu" });
      expect(input).toHaveFocus();
      fireEvent.change(input, { target: { value: "  Nowy plan  " } });
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.blur(input);
      expect(onSave).toHaveBeenCalledExactlyOnceWith("Nowy plan");
    },
  );

  it("saves on blur and skips an unchanged name", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<PlanNameEditor name="Plan" disabled={false} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.blur(screen.getByRole("textbox"));
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Inny" },
    });
    fireEvent.blur(screen.getByRole("textbox"));
    expect(onSave).toHaveBeenCalledExactlyOnceWith("Inny");
  });

  it("cancels on Escape without saving on blur", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<PlanNameEditor name="Plan" disabled={false} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Inny" } });
    fireEvent.keyDown(input, { key: "Escape" });
    fireEvent.blur(input);
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Plan" })).toBeInTheDocument();
  });

  it("rejects an empty name and limits length to 100 characters", () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<PlanNameEditor name="Plan" disabled={false} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Plan" }));
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "100");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.blur(input);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nazwa planu nie może być pusta",
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("disables both ways of starting editing", () => {
    render(<PlanNameEditor name="Plan" disabled onSave={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Plan" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Edytuj nazwę planu" }),
    ).toBeDisabled();
  });
});
