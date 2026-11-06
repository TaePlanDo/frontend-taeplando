import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PlanGenerationStatus } from "@/types/plan";

import { PlanGenerationPage } from "./PlanGenerationPage";

const usePlanGenerationStatus = vi.fn();

vi.mock("@/hooks/plans/usePlanGenerationStatus", () => ({
  usePlanGenerationStatus: (...args: unknown[]) =>
    usePlanGenerationStatus(...args),
}));

function renderPage(jobId = "job-1") {
  return render(
    <MemoryRouter initialEntries={[`/plan-generation/${jobId}`]}>
      <Routes>
        <Route
          path="/plan-generation/:jobId"
          element={<PlanGenerationPage />}
        />
        <Route path="/plans/:planId" element={<div>Plan detail</div>} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PlanGenerationPage", () => {
  beforeEach(() => {
    usePlanGenerationStatus.mockReset();
  });

  it("shows spinner while generation is running", () => {
    usePlanGenerationStatus.mockReturnValue({
      job: {
        id: "job-1",
        status: "RUNNING",
        plan_id: null,
        error_code: null,
        error_message: null,
      } satisfies PlanGenerationStatus,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByLabelText("Generowanie planu…")).toBeTruthy();
  });

  it("redirects to plan detail on success", async () => {
    usePlanGenerationStatus.mockReturnValue({
      job: {
        id: "job-1",
        status: "SUCCEEDED",
        plan_id: "plan-1",
        error_code: null,
        error_message: null,
      } satisfies PlanGenerationStatus,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Plan detail")).toBeTruthy();
    });
  });

  it("shows error message on failure", () => {
    usePlanGenerationStatus.mockReturnValue({
      job: {
        id: "job-1",
        status: "FAILED",
        plan_id: null,
        error_code: "GENERATION_FAILED",
        error_message: "Brak pasujących ćwiczeń",
      } satisfies PlanGenerationStatus,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("Generowanie nie powiodło się")).toBeTruthy();
    expect(screen.getByText("Brak pasujących ćwiczeń")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Wróć do strony głównej" }),
    ).toBeTruthy();
  });

  it("treats succeeded without plan id as failure", () => {
    usePlanGenerationStatus.mockReturnValue({
      job: {
        id: "job-1",
        status: "SUCCEEDED",
        plan_id: null,
        error_code: null,
        error_message: null,
      } satisfies PlanGenerationStatus,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText("Generowanie nie powiodło się")).toBeTruthy();
  });
});
