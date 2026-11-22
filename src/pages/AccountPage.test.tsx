import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthContextValue } from "@/auth/authContext";

import { AccountPage } from "./AccountPage";

const logout = vi.fn();

const authState: AuthContextValue = {
  user: null,
  status: "authenticated",
  isAuthenticated: true,
  isLoggingIn: false,
  isLoggingOut: false,
  loginError: null,
  login: vi.fn(),
  register: vi.fn(),
  logout,
  registerError: null,
  isRegistering: false,
  updateName: vi.fn(),
  isUpdatingName: false,
  updateNameError: null,
  changePassword: vi.fn(),
  isChangingPassword: false,
  changePasswordError: null,
};

vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: () => authState,
}));

describe("AccountPage", () => {
  beforeEach(() => {
    logout.mockReset();
    vi.mocked(authState.updateName).mockReset();
    authState.isLoggingOut = false;
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
    expect(screen.getByText("Hasło", { exact: true })).toBeTruthy();
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
    expect(screen.queryByText("Hasło", { exact: true })).toBeNull();
  });

  it("closes the name editor after a successful update", async () => {
    vi.mocked(authState.updateName).mockResolvedValue(undefined);
    render(<AccountPage />);

    fireEvent.click(screen.getByRole("button", { name: "Zmień nazwę" }));
    const dialog = screen.getByRole("dialog", {
      name: "Zmień nazwę użytkownika",
    });
    fireEvent.change(within(dialog).getByLabelText("Nazwa użytkownika"), {
      target: { value: "Nowa nazwa" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Zmień dane" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(authState.updateName).toHaveBeenCalledWith("Nowa nazwa");
  });

  it("calls logout after clicking the logout button", () => {
    render(<AccountPage />);

    fireEvent.click(screen.getByRole("button", { name: /Wyloguj/ }));

    expect(logout).toHaveBeenCalledOnce();
  });

  it("disables the logout button while logging out", () => {
    authState.isLoggingOut = true;
    render(<AccountPage />);

    expect(screen.getByRole("button", { name: /Wyloguj/ })).toBeDisabled();
  });
});
