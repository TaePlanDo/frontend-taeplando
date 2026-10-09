import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { HomePage } from "@/pages/HomePage";

vi.mock("@/lib/api/health", () => ({
  fetchHealth: vi.fn().mockResolvedValue({ status: "ok" }),
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <HomePage />
    </QueryClientProvider>,
  );
}

describe("HomePage", () => {
  it("renders heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Frontend" })).toBeTruthy();
  });
});
