import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import type { AuthContextValue } from "@/auth/authContext";

import { LoginPage } from "./LoginPage";

const navigate = vi.fn();
const login = vi.fn();
const startGoogleLogin = vi.fn();

const authState: AuthContextValue = {
  user: null,
  status: "unauthenticated",
  isAuthenticated: false,
  isLoggingIn: false,
  loginError: null,
  login,
  register: vi.fn(),
  registerError: null,
  isRegistering: false,
  updateName: vi.fn(),
  isUpdatingName: false,
  updateNameError: null,
};

const searchParams = new URLSearchParams();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigate,
    useSearchParams: () => [searchParams, vi.fn()],
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

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    login.mockReset();
    startGoogleLogin.mockReset();
    searchParams.delete("error");
    authState.status = "unauthenticated";
    authState.isLoggingIn = false;
    authState.loginError = null;
    authState.isAuthenticated = false;
  });

  it("submits credentials and navigates home", async () => {
    login.mockResolvedValue(undefined);
    renderLoginPage();

    fillAndSubmit("trainer@example.com", "password123");

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "trainer@example.com",
        password: "password123",
      });
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows Polish loginError from auth context", () => {
    authState.loginError = "Nieprawidłowy email lub hasło";
    renderLoginPage();

    expect(screen.getByRole("alert").textContent).toBe(
      "Nieprawidłowy email lub hasło",
    );
  });

  it("shows OAuth error from query when auth loginError is null", () => {
    searchParams.set("error", "oauth");
    renderLoginPage();

    expect(screen.getByRole("alert").textContent).toBe(
      "Logowanie przez Google nie powiodło się",
    );
  });

  it("prefers auth loginError over OAuth query error", () => {
    searchParams.set("error", "oauth");
    authState.loginError = "Nieprawidłowy email lub hasło";
    renderLoginPage();

    expect(screen.getByRole("alert").textContent).toBe(
      "Nieprawidłowy email lub hasło",
    );
  });

  it("does not navigate when login rejects", async () => {
    login.mockRejectedValue(new Error("fail"));
    renderLoginPage();

    fillAndSubmit("trainer@example.com", "password123");

    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("disables buttons while logging in", () => {
    authState.isLoggingIn = true;
    renderLoginPage();

    expect(screen.getByRole("button", { name: "Zaloguj się" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Dołącz z Google" }),
    ).toBeDisabled();
  });

  it("starts Google login on button click", () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole("button", { name: "Dołącz z Google" }));

    expect(startGoogleLogin).toHaveBeenCalledTimes(1);
  });
});
