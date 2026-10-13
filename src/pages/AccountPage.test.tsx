import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthContextValue } from "@/auth/authContext";

import { AccountPage } from "./AccountPage";

const authState: AuthContextValue = {
  user: null,
  status: "authenticated",
  isAuthenticated: true,
  isLoggingIn: false,
  loginError: null,
  login: vi.fn(),
  updateName: vi.fn(),
  isUpdatingName: false,
  updateNameError: null,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

describe("AccountPage", () => {
  beforeEach(() => {
    authState.user = {
      id: "1",
      email: "jankowalski@gmail.com",
      full_name: "Jan Kowalski",
      auth_method: "LOCAL",
    };
  });

  it("shows name and email for a LOCAL user with change buttons", () => {
    render(<AccountPage />);

    expect(screen.getByText("Jan Kowalski")).toBeTruthy();
    expect(screen.getByText("jankowalski@gmail.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zmień nazwę" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zmień hasło" })).toBeTruthy();
  });

  it("hides change buttons for a GOOGLE user but still shows the data", () => {
    authState.user = {
      id: "2",
      email: "google@example.com",
      full_name: "Google User",
      auth_method: "GOOGLE",
    };
    render(<AccountPage />);

    expect(screen.getByText("Google User")).toBeTruthy();
    expect(screen.getByText("google@example.com")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Zmień nazwę" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Zmień hasło" })).toBeNull();
  });
});
