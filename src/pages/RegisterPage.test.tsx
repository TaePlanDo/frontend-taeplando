import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthContextValue } from "@/auth/authContext";

import { RegisterPage } from "./RegisterPage";

const navigate = vi.fn();
const register = vi.fn();
const startGoogleLogin = vi.fn();

const authState: AuthContextValue = {
  user: null,
  status: "unauthenticated",
  isAuthenticated: false,
  isLoggingIn: false,
  isLoggingOut: false,
  loginError: null,
  login: vi.fn(),
  register,
  logout: vi.fn(),
  registerError: null,
  isRegistering: false,
  updateName: vi.fn(),
  isUpdatingName: false,
  updateNameError: null,
  changePassword: vi.fn(),
  isChangingPassword: false,
  changePasswordError: null,
};

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigate };
});

vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/api/auth", () => ({
  startGoogleLogin: () => startGoogleLogin(),
}));

function renderRegistration() {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Hasło"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Powtórz hasło"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Zarejestruj się" }));
}

describe("RegisterPage", () => {
  beforeEach(() => {
    navigate.mockReset();
    register.mockReset();
    startGoogleLogin.mockReset();
    authState.registerError = null;
    authState.isRegistering = false;
  });

  it("submits credentials and navigates home", async () => {
    register.mockResolvedValue(undefined);
    renderRegistration();

    fillAndSubmit("trainer@example.com", "Trening123!");

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        email: "trainer@example.com",
        password: "Trening123!",
      });
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("shows Polish registerError from auth context", () => {
    authState.registerError = "Użytkownik o podanym emailu już istnieje";
    renderRegistration();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Użytkownik o podanym emailu już istnieje",
    );
  });

  it("does not navigate when registration rejects", async () => {
    register.mockRejectedValue(new Error("fail"));
    renderRegistration();

    await act(async () => {
      fillAndSubmit("trainer@example.com", "Trening123!");
    });

    expect(register).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("disables buttons while registering", () => {
    authState.isRegistering = true;
    renderRegistration();

    expect(
      screen.getByRole("button", { name: "Rejestrowanie..." }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Dołącz z Google" }),
    ).toBeDisabled();
  });

  it("starts Google login on button click", () => {
    renderRegistration();

    fireEvent.click(screen.getByRole("button", { name: "Dołącz z Google" }));

    expect(startGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it("does not register when passwords differ", () => {
    renderRegistration();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "trainer@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Hasło"), {
      target: { value: "Trening123!" },
    });

    fireEvent.change(screen.getByLabelText("Powtórz hasło"), {
      target: { value: "Inne123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Zarejestruj się" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Hasła nie są zgodne");
    expect(register).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
