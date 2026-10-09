import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthStatus } from "@/types/auth";

import { RedirectIfAuth } from "./RedirectIfAuth";

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

function renderAtLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/" element={<p>home page</p>} />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <p>login content</p>
            </RedirectIfAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RedirectIfAuth", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.status = "unauthenticated";
  });

  it("shows loading state", () => {
    authState.status = "loading";
    renderAtLogin();
    expect(screen.getByText("Ładowanie…")).toBeTruthy();
  });

  it("redirects authenticated users to /", () => {
    authState.isAuthenticated = true;
    authState.status = "authenticated";
    renderAtLogin();
    expect(screen.getByText("home page")).toBeTruthy();
  });

  it("renders children when unauthenticated", () => {
    renderAtLogin();
    expect(screen.getByText("login content")).toBeTruthy();
  });
});
