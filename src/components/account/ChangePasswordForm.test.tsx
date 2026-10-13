import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import type { AuthContextValue } from "@/auth/authContext";
import type { User } from "@/types/auth";

import { ChangePasswordForm } from "./ChangePasswordForm";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const user: User = {
  id: "1",
  email: "jankowalski@gmail.com",
  full_name: "Jan Kowalski",
  auth_method: "LOCAL",
};

const changePassword = vi.fn();

const authState: AuthContextValue = {
  user,
  status: "authenticated",
  isAuthenticated: true,
  isLoggingIn: false,
  loginError: null,
  login: vi.fn(),
  register: vi.fn(),
  registerError: null,
  isRegistering: false,
  updateName: vi.fn(),
  isUpdatingName: false,
  updateNameError: null,
  changePassword,
  isChangingPassword: false,
  changePasswordError: null,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

function renderForm(onClose = vi.fn()) {
  render(<ChangePasswordForm onClose={onClose} />);
  return { onClose };
}

function fillAndSubmit(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  fireEvent.change(screen.getByLabelText("Stare Hasło"), {
    target: { value: oldPassword },
  });
  fireEvent.change(screen.getByLabelText("Nowe Hasło"), {
    target: { value: newPassword },
  });
  fireEvent.change(screen.getByLabelText("Powtórz Hasło"), {
    target: { value: confirmPassword },
  });
  fireEvent.click(screen.getByRole("button", { name: "Zmień hasło" }));
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    changePassword.mockReset();
    authState.isChangingPassword = false;
    authState.changePasswordError = null;
  });

  it("submits the new password, toasts and closes on success", async () => {
    changePassword.mockResolvedValue(undefined);
    const { onClose } = renderForm();

    fillAndSubmit("Stare123!", "Trening123!", "Trening123!");

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        old_password: "Stare123!",
        new_password: "Trening123!",
      });
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith(
        "Hasło zostało zaktualizowane",
      );
    });
  });

  it("shows the error and keeps the dialog open when change fails", async () => {
    changePassword.mockRejectedValue(new Error("fail"));
    authState.changePasswordError = "Niepoprawne hasło";
    const { onClose } = renderForm();

    fillAndSubmit("Stare123!", "Trening123!", "Trening123!");

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        old_password: "Stare123!",
        new_password: "Trening123!",
      });
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByText("Niepoprawne hasło")).toBeTruthy();
  });

  it("shows a validation error and does not submit when passwords differ", () => {
    const { onClose } = renderForm();

    fillAndSubmit("Stare123!", "Trening123!", "Inne123!");

    expect(screen.getByText("Hasła nie są zgodne")).toBeTruthy();
    expect(changePassword).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows a validation error when the old password is missing", () => {
    const { onClose } = renderForm();

    fillAndSubmit("", "Trening123!", "Trening123!");

    expect(screen.getByText("Podaj obecne hasło")).toBeTruthy();
    expect(changePassword).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("disables the inputs and button while changing", () => {
    authState.isChangingPassword = true;
    renderForm();

    expect(screen.getByLabelText("Stare Hasło")).toBeDisabled();
    expect(screen.getByLabelText("Nowe Hasło")).toBeDisabled();
    expect(screen.getByLabelText("Powtórz Hasło")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zmień hasło" })).toBeDisabled();
  });
});
