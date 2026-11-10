import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { planFixture } from "@/test/planFixture";

import { PlanDetailPage } from "./PlanDetailPage";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const usePlan = vi.fn();
const startPlanGeneration = vi.fn();
const deletePlan = vi.fn();

vi.mock("@/hooks/plans/usePlan", () => ({
  usePlan: (...args: unknown[]) => usePlan(...args),
}));

vi.mock("@/hooks/plans/useStartPlanGeneration", () => ({
  useStartPlanGeneration: () => ({
    startPlanGeneration,
    isStarting: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("@/hooks/plans/useDeletePlan", () => ({
  useDeletePlan: () => ({
    deletePlan,
    isDeleting: false,
    error: null,
  }),
}));

function renderPage(
  initialEntry: string | { pathname: string; state?: object } = "/plans/plan-1",
) {
  return render(
    <MemoryRouter
      initialEntries={[
        typeof initialEntry === "string"
          ? initialEntry
          : {
              pathname: initialEntry.pathname,
              state: initialEntry.state,
            },
      ]}
    >
      <Routes>
        <Route path="/plans/:planId" element={<PlanDetailPage />} />
        <Route
          path="/plans/generation/:jobId"
          element={<div>Generation job</div>}
        />
        <Route path="/plans" element={<div>Plans list</div>} />
        <Route path="/plans/new" element={<div>Plan new</div>} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PlanDetailPage", () => {
  beforeEach(() => {
    usePlan.mockReset();
    startPlanGeneration.mockReset();
    deletePlan.mockReset();
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
    usePlan.mockReturnValue({
      plan: planFixture,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("renders plan header, phases and exercises", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Plan A" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Wróć do listy" })).toBeTruthy();
    expect(screen.getByText("Młodzież")).toBeTruthy();
    expect(screen.getByText("Sprzęt dostępny na sali")).toBeTruthy();
    expect(screen.getAllByText(/Rozgrzewka/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Część główna/).length).toBeGreaterThan(0);
    expect(screen.getByText("Bieg")).toBeTruthy();
    expect(screen.getByText("Sparing")).toBeTruthy();
    expect(screen.getAllByText("Tarcza").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Intensywność").length).toBeGreaterThan(0);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("labels back navigation toward the generation form", () => {
    renderPage({
      pathname: "/plans/plan-1",
      state: { backTo: "/plans/new?group=group-1&participants=20" },
    });

    expect(
      screen.getByRole("button", { name: "Wróć do generowania" }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Wróć do generowania" }),
    );
    expect(screen.getByText("Plan new")).toBeTruthy();
  });

  it("keeps list back label for list origins", () => {
    renderPage({
      pathname: "/plans/plan-1",
      state: { backTo: "/plans?name=kata" },
    });

    expect(screen.getByRole("button", { name: "Wróć do listy" })).toBeTruthy();
  });

  it("opens regenerate dialog with prefilled participant count", async () => {
    startPlanGeneration.mockResolvedValue({
      id: "job-2",
      status: "QUEUED",
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Wygeneruj ponownie" }));

    expect(
      screen.getByRole("heading", { name: "Potwierdź liczebność grupy" }),
    ).toBeTruthy();

    const input = screen.getByLabelText(
      "Liczba uczestników",
    ) as HTMLInputElement;
    expect(input.value).toBe("10");

    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Generuj" }));

    await waitFor(() => {
      expect(startPlanGeneration).toHaveBeenCalledWith({
        training_group_id: "group-1",
        participant_count: 12,
        available_equipment_ids: ["eq-1"],
        training_type_id: "tt-1",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Generation job")).toBeTruthy();
    });
  });

  it("deletes the plan after confirmation and leaves the page", async () => {
    deletePlan.mockResolvedValue(undefined);

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));
    expect(
      screen.getByRole("heading", { name: "Usuwanie planu" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));

    await waitFor(() => {
      expect(deletePlan).toHaveBeenCalledWith("plan-1");
    });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Plan został usunięty");
      expect(screen.getByText("Plans list")).toBeTruthy();
    });
  });

  it("shows an error toast when delete fails and stays on the page", async () => {
    deletePlan.mockRejectedValue(new Error("Serwer niedostępny"));

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));
    fireEvent.click(screen.getByRole("button", { name: "Usuń" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Serwer niedostępny");
    });
    expect(screen.getByRole("heading", { name: "Plan A" })).toBeTruthy();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
