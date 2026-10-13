import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
});
