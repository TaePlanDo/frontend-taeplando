import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { CustomizedInput } from "./CustomizedInput";

describe("CustomizedInput", () => {
  it("keeps the password hidden and shows no toggle when showPasswordButton is unset", () => {
    render(<CustomizedInput label="Hasło" name="password" type="password" />);

    const input = screen.getByLabelText("Hasło") as HTMLInputElement;
    expect(input.type).toBe("password");
    expect(screen.queryByRole("button", { name: "Pokaż hasło" })).toBeNull();
  });

  it("toggles the password visibility when showPasswordButton is set", () => {
    render(
      <CustomizedInput
        label="Hasło"
        name="password"
        type="password"
        showPasswordButton
      />,
    );

    const input = screen.getByLabelText("Hasło") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: "Pokaż hasło" });

    expect(input.type).toBe("password");

    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Ukryj hasło" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ukryj hasło" }));
    expect(input.type).toBe("password");
    expect(screen.getByRole("button", { name: "Pokaż hasło" })).toBeTruthy();
  });

  it("does not show the toggle for non-password inputs", () => {
    render(
      <CustomizedInput
        label="Email"
        name="email"
        type="email"
        showPasswordButton
      />,
    );

    expect(screen.queryByRole("button", { name: "Pokaż hasło" })).toBeNull();
  });

  describe("numeric stepper", () => {
    const increase = () => screen.getByRole("button", { name: "Zwiększ Wiek" });
    const decrease = () =>
      screen.getByRole("button", { name: "Zmniejsz Wiek" });

    function renderNumber(
      props: Partial<ComponentProps<typeof CustomizedInput>> = {},
    ) {
      const onValueChange = vi.fn();
      render(
        <CustomizedInput
          label="Wiek"
          name="age"
          type="number"
          value="5"
          onChange={() => {}}
          onValueChange={onValueChange}
          {...props}
        />,
      );
      return onValueChange;
    }

    it("renders the stepper only for number inputs", () => {
      render(<CustomizedInput label="Imię" name="name" type="text" />);

      expect(screen.queryByRole("button", { name: "Zwiększ Imię" })).toBeNull();
      expect(
        screen.queryByRole("button", { name: "Zmniejsz Imię" }),
      ).toBeNull();
    });

    it("propagates the incremented and decremented value as a string", () => {
      const onValueChange = renderNumber();

      fireEvent.click(increase());
      expect(onValueChange).toHaveBeenLastCalledWith("6");

      fireEvent.click(decrease());
      expect(onValueChange).toHaveBeenLastCalledWith("4");
      expect(onValueChange).toHaveBeenCalledTimes(2);
    });

    it("uses the step prop for the size of one change", () => {
      const onValueChange = renderNumber({ step: 5 });

      fireEvent.click(increase());
      expect(onValueChange).toHaveBeenLastCalledWith("10");

      fireEvent.click(decrease());
      expect(onValueChange).toHaveBeenLastCalledWith("0");
    });

    it("clamps to max when increasing past the upper bound", () => {
      const onValueChange = renderNumber({ value: "99", max: 99 });

      fireEvent.click(increase());

      expect(onValueChange).toHaveBeenCalledWith("99");
    });

    it("clamps to min when decreasing past the lower bound", () => {
      const onValueChange = renderNumber({ value: "1", min: 1 });

      fireEvent.click(decrease());

      expect(onValueChange).toHaveBeenCalledWith("1");
    });

    it("pulls an out-of-range value back into the allowed range", () => {
      const onValueChange = renderNumber({ value: "150", min: 1, max: 99 });

      fireEvent.click(increase());
      expect(onValueChange).toHaveBeenLastCalledWith("99");

      fireEvent.click(decrease());
      expect(onValueChange).toHaveBeenLastCalledWith("99");
    });

    it("treats an empty value as zero and respects min", () => {
      const onValueChange = renderNumber({ value: "" });

      fireEvent.click(increase());
      expect(onValueChange).toHaveBeenLastCalledWith("1");

      fireEvent.click(decrease());
      expect(onValueChange).toHaveBeenLastCalledWith("-1");
    });

    it("treats a non numeric value as zero", () => {
      const onValueChange = renderNumber({ value: "abc", min: 0 });

      fireEvent.click(increase());
      expect(onValueChange).toHaveBeenLastCalledWith("1");

      fireEvent.click(decrease());
      expect(onValueChange).toHaveBeenLastCalledWith("0");
    });

    it("disables both controls and ignores clicks when disabled", () => {
      const onValueChange = renderNumber({ disabled: true });

      const up = increase() as HTMLButtonElement;
      const down = decrease() as HTMLButtonElement;
      expect(up.disabled).toBe(true);
      expect(down.disabled).toBe(true);

      fireEvent.click(up);
      fireEvent.click(down);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("does nothing and does not throw without onValueChange", () => {
      render(
        <CustomizedInput
          label="Wiek"
          name="age"
          type="number"
          value="5"
          onChange={() => {}}
        />,
      );

      expect(() => {
        fireEvent.click(increase());
        fireEvent.click(decrease());
      }).not.toThrow();
      expect((screen.getByLabelText("Wiek") as HTMLInputElement).value).toBe(
        "5",
      );
    });
  });
});
