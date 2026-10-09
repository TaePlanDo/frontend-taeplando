import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthStatus } from "@/types/auth";

import { RequireAuth } from "./RequireAuth";

const authState: {
  isAuthenticated: boolean;
  status: AuthStatus;
} = {
  isAuthenticated: false,
  status: "unauthenticated",
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

function renderAtHome(override = false) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route
          path="/"
          element={
            <RequireAuth override={override}>
              <p>private content</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.status = "unauthenticated";
  });

  it("shows loading state", () => {
    authState.status = "loading";
    renderAtHome();
    expect(screen.getByRole("status", { name: "Ładowanie…" })).toBeTruthy();
  });

  it("redirects guests to /login", () => {
    renderAtHome();
    expect(screen.getByText("login page")).toBeTruthy();
  });

  it("renders children when authenticated", () => {
    authState.isAuthenticated = true;
    authState.status = "authenticated";
    renderAtHome();
    expect(screen.getByText("private content")).toBeTruthy();
  });

  it("renders children when override is true", () => {
    renderAtHome(true);
    expect(screen.getByText("private content")).toBeTruthy();
  });
});
