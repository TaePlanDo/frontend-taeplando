import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import type { AuthContextValue } from "@/auth/authContext";
import type { User } from "@/types/auth";

import { ChangeUsernameForm } from "./ChangeUsernameForm";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const user: User = {
  id: "1",
  email: "jankowalski@gmail.com",
  full_name: "Jan Kowalski",
  auth_method: "LOCAL",
};

const updateName = vi.fn();

const authState: AuthContextValue = {
  user,
  status: "authenticated",
  isAuthenticated: true,
  isLoggingIn: false,
  isLoggingOut: false,
  loginError: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  registerError: null,
  isRegistering: false,
  updateName,
  isUpdatingName: false,
  updateNameError: null,
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

function renderForm(onClose = vi.fn()) {
  render(<ChangeUsernameForm onClose={onClose} />);
  return { onClose };
}

describe("ChangeUsernameForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateName.mockReset();
    authState.user = user;
    authState.isUpdatingName = false;
    authState.updateNameError = null;
  });

  it("prefills the input with the current user name", () => {
    renderForm();

    const input = screen.getByLabelText(
      "Nazwa użytkownika",
    ) as HTMLInputElement;
    expect(input.value).toBe("Jan Kowalski");
  });

  it("submits the new name, toasts and closes on success", async () => {
    updateName.mockResolvedValue(undefined);
    const { onClose } = renderForm();

    const input = screen.getByLabelText(
      "Nazwa użytkownika",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jan Nowak" } });
    fireEvent.click(screen.getByRole("button", { name: "Zmień dane" }));

    await waitFor(() => {
      expect(updateName).toHaveBeenCalledWith("Jan Nowak");
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("Dane zostały zaktualizowane");
    });
  });

  it("shows the error and keeps the dialog open when update fails", async () => {
    updateName.mockRejectedValue(new Error("fail"));
    authState.updateNameError = "Niepoprawna nazwa użytkownika";
    const { onClose } = renderForm();

    const input = screen.getByLabelText("Nazwa użytkownika");
    fireEvent.change(input, { target: { value: "Jan Nowak" } });
    fireEvent.click(screen.getByRole("button", { name: "Zmień dane" }));

    await waitFor(() => {
      expect(updateName).toHaveBeenCalledWith("Jan Nowak");
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByText("Niepoprawna nazwa użytkownika")).toBeTruthy();
  });

  it("disables the input and button while updating", () => {
    authState.isUpdatingName = true;
    renderForm();

    expect(screen.getByLabelText("Nazwa użytkownika")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zmień dane" })).toBeDisabled();
  });
});
