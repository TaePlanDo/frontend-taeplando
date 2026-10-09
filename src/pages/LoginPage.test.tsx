import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";
import type { AuthContextValue } from "@/auth/authContext";

import { LoginPage } from "./LoginPage";

const navigate = vi.fn();
const login = vi.fn();
const startGoogleLogin = vi.fn();

const authState: AuthContextValue = {
  user: null,
  status: "unauthenticated",
  errorCode: null,
  isAuthenticated: false,
  login,
};

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/api/auth", () => ({
  startGoogleLogin: () => startGoogleLogin(),
}));

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Hasło"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Zaloguj się" }));
}

describe("LoginPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    login.mockReset();
    startGoogleLogin.mockReset();
    authState.status = "unauthenticated";
    authState.errorCode = null;
    authState.isAuthenticated = false;
  });

  it("submits credentials and navigates home", async () => {
    login.mockResolvedValue(undefined);
    render(<LoginPage />);

    fillAndSubmit("trainer@example.com", "password123");

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "trainer@example.com",
        password: "password123",
      });
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows invalid credentials message from errorCode", () => {
    authState.errorCode = "invalidCredentials";
    authState.status = "error";
    render(<LoginPage />);

    expect(screen.getByRole("alert").textContent).toBe(
      "Nieprawidłowy email lub hasło",
    );
  });

  it("shows ApiError message when login throws", async () => {
    login.mockRejectedValue(new ApiError(401, "Invalid credentials"));
    render(<LoginPage />);

    fillAndSubmit("trainer@example.com", "password123");

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "401: Invalid credentials",
      );
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("disables buttons while loading", () => {
    authState.status = "loading";
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "Zaloguj się" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Dołącz z Google" }),
    ).toBeDisabled();
  });

  it("starts Google login on button click", () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "Dołącz z Google" }));

    expect(startGoogleLogin).toHaveBeenCalledTimes(1);
  });
});
