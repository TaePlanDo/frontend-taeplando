import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { ChangeUsernameForm } from "./ChangeUsernameForm";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const user = {
  id: "1",
  email: "jankowalski@gmail.com",
  full_name: "Jan Kowalski",
  auth_method: "LOCAL",
};

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  };
}

function renderForm(onClose = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  render(
    <QueryClientProvider client={client}>
      <ChangeUsernameForm onClose={onClose} />
    </QueryClientProvider>,
  );
  return { client, onClose };
}

describe("ChangeUsernameForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the input empty while the user loads, then prefills it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, user));
    vi.stubGlobal("fetch", fetchMock);

    renderForm();

    const input = screen.getByLabelText(
      "Nazwa użytkownika",
    ) as HTMLInputElement;
    expect(input.value).toBe("");

    await waitFor(() => {
      expect(input.value).toBe("Jan Kowalski");
    });
  });

  it("submits the new name, toasts, closes and updates the auth cache", async () => {
    const onClose = vi.fn();
    const updatedUser = { ...user, full_name: "Jan Nowak" };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, user))
      .mockResolvedValueOnce(jsonResponse(200, updatedUser));
    vi.stubGlobal("fetch", fetchMock);

    const { client } = renderForm(onClose);

    const input = screen.getByLabelText(
      "Nazwa użytkownika",
    ) as HTMLInputElement;
    await waitFor(() => {
      expect(input.value).toBe("Jan Kowalski");
    });

    fireEvent.change(input, { target: { value: "Jan Nowak" } });
    fireEvent.click(screen.getByRole("button", { name: "Zmień dane" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/me",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ full_name: "Jan Nowak" }),
        }),
      );
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("Dane zostały zaktualizowane");
    });

    expect(client.getQueryData(["auth", "me"])).toEqual(updatedUser);
  });

  it("shows the validation message when the update fails with a client error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, user))
      .mockResolvedValueOnce(
        jsonResponse(422, { detail: "Full name cannot be blank" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { onClose } = renderForm();

    const input = screen.getByLabelText("Nazwa użytkownika");
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe("Jan Kowalski");
    });

    fireEvent.click(screen.getByRole("button", { name: "Zmień dane" }));

    await waitFor(() => {
      expect(screen.getByText("Niepoprawna nazwa użytkownika")).toBeTruthy();
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("treats an authorization error as a server error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, user))
      .mockResolvedValueOnce(
        jsonResponse(401, { detail: "Not authenticated" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    renderForm();

    const input = screen.getByLabelText("Nazwa użytkownika");
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe("Jan Kowalski");
    });

    fireEvent.click(screen.getByRole("button", { name: "Zmień dane" }));

    await waitFor(() => {
      expect(
        screen.getByText("Spróbuj ponownie poźniej, wystąpił błąd."),
      ).toBeTruthy();
    });
  });

  it("shows the generic message when the server fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, user))
      .mockResolvedValueOnce(
        jsonResponse(500, { detail: "Internal Server Error" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    renderForm();

    const input = screen.getByLabelText("Nazwa użytkownika");
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe("Jan Kowalski");
    });

    fireEvent.click(screen.getByRole("button", { name: "Zmień dane" }));

    await waitFor(() => {
      expect(
        screen.getByText("Spróbuj ponownie poźniej, wystąpił błąd."),
      ).toBeTruthy();
    });
  });
});
