import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/plans/plan-1"]}>
      <Routes>
        <Route path="/plans/:planId" element={<PlanDetailPage />} />
        <Route
          path="/plans/generation/:jobId"
          element={<div>Generation job</div>}
        />
        <Route path="/plans" element={<div>Plans list</div>} />
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
    const phaseHeader = screen.getByRole("button", { name: /Rozgrzewka/ });
    expect(phaseHeader).toHaveClass("sticky");
    expect(
      within(phaseHeader)
        .getAllByText("Intensywność")[0]
        .closest("[data-slot=badge]"),
    ).toHaveClass("text-emerald-400");
    expect(
      within(phaseHeader)
        .getAllByText("Trudność")[0]
        .closest("[data-slot=badge]"),
    ).toHaveClass("text-violet-300");
    const row = screen.getByRole("button", { name: /Bieg/ });
    expect(within(row).getByText("2+")).toBeTruthy();
    expect(within(row).getAllByRole("meter")).toHaveLength(5);
    expect(
      within(row).getByRole("meter", { name: "Intensywność" }),
    ).toHaveAttribute("aria-valuenow", "2");
    expect(within(row).getByText("1")).toBeTruthy();
    expect(
      within(screen.getByRole("button", { name: /Sparing/ })).getByText("1"),
    ).toBeTruthy();
  });

  it("opens exercise snapshot details from a plan row", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Bieg/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByText(planFixture.exercises[0].description_snapshot),
    ).toBeTruthy();
    expect(screen.getByText("Liczba uczestników")).toBeTruthy();
    expect(
      within(screen.getByRole("dialog")).getAllByRole("meter"),
    ).toHaveLength(5);
    expect(
      within(screen.getByRole("dialog")).getByRole("meter", {
        name: "Intensywno\u015b\u0107",
      }),
    ).toHaveAttribute(
      "aria-valuenow",
      String(planFixture.exercises[0].physical_difficulty_snapshot),
    );
    fireEvent.click(screen.getByRole("button", { name: "Zamknij" }));
    expect(screen.queryByRole("dialog")).toBeNull();
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
