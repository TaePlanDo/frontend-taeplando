import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";

import { App } from "./App";

vi.mock("@/routes/RequireAuth", () => ({
  RequireAuth: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/pages/EquipmentListPage", () => ({
  EquipmentListPage: () => <p>equipment page</p>,
}));

it("renders the equipment page at /equipment", () => {
  render(
    <MemoryRouter initialEntries={["/equipment"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText("equipment page")).toBeTruthy();
});
