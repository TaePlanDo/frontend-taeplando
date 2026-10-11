import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { HealthCheckPage } from "@/pages/HealthCheckPage";

vi.mock("@/lib/api/health", () => ({
  fetchHealth: vi.fn().mockResolvedValue({ status: "ok" }),
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <HealthCheckPage />
    </QueryClientProvider>,
  );
}

describe("HealthCheckPage", () => {
  it("renders heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Frontend" })).toBeTruthy();
  });
});
