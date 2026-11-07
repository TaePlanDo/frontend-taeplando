import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";

import { startPlanGenerationRequest } from "@/lib/api/plan-generation";
import { PlanNewPage } from "./PlanNewPage";

vi.mock("@/lib/api/plan-generation", () => ({
  startPlanGenerationRequest: vi.fn(),
}));
vi.mock("@/hooks/plans/usePlanGenerationOptions", () => ({
  usePlanGenerationOptions: () => ({
    groups: {
      data: [{ id: "group-1", name: "Grupa dzieci" }],
      isSuccess: true,
    },
    equipment: {
      data: [{ id: "equipment-1", name: "Tarcze" }],
      isSuccess: true,
    },
    trainingTypes: {
      data: [{ id: "type-1", name: "Technika" }],
      isSuccess: true,
    },
  }),
}));

function Job() {
  const { jobId } = useParams();
  return <p>Zadanie: {jobId}</p>;
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/plans/new"]}>
        <Routes>
          <Route path="/plans/new" element={<PlanNewPage />} />
          <Route path="/plans/generation/:jobId" element={<Job />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function select(label: string, option: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: label }), {
    key: "ArrowDown",
  });
  fireEvent.click(screen.getByRole("option", { name: option }));
}

beforeEach(() => vi.resetAllMocks());

it("requires a group and submits Auto with 20 participants and no equipment", async () => {
  vi.mocked(startPlanGenerationRequest).mockResolvedValue({
    id: "job-1",
    status: "QUEUED",
  });
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Generuj Plan" }));
  expect(await screen.findByText("Wybierz grupę treningową")).toBeVisible();
  expect(startPlanGenerationRequest).not.toHaveBeenCalled();
  select("Grupa treningowa", "Grupa dzieci");
  fireEvent.click(screen.getByRole("button", { name: "Generuj Plan" }));
  expect(await screen.findByText("Zadanie: job-1")).toBeVisible();
  expect(startPlanGenerationRequest).toHaveBeenCalledWith({
    training_group_id: "group-1",
    participant_count: 20,
    available_equipment_ids: [],
    training_type_id: null,
  });
});

it("submits selected options and blocks edits and duplicate requests while starting", async () => {
  vi.mocked(startPlanGenerationRequest).mockReturnValue(new Promise(() => {}));
  renderPage();
  select("Grupa treningowa", "Grupa dzieci");
  select("Sprzęt treningowy", "Tarcze");
  select("Typ treningu", "Technika");
  fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
  fireEvent.click(screen.getByRole("button", { name: "Generuj Plan" }));
  const button = await screen.findByRole("button", { name: "Rozpoczynanie…" });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(screen.getByRole("button", { name: "Usuń Tarcze" })).toBeDisabled();
  expect(
    screen.getByRole("combobox", { name: "Grupa treningowa" }),
  ).toBeDisabled();
  await waitFor(() =>
    expect(startPlanGenerationRequest).toHaveBeenCalledTimes(1),
  );
  expect(startPlanGenerationRequest).toHaveBeenCalledWith({
    training_group_id: "group-1",
    participant_count: 50,
    available_equipment_ids: ["equipment-1"],
    training_type_id: "type-1",
  });
});

it("keeps selections on a server error and allows another attempt", async () => {
  vi.mocked(startPlanGenerationRequest)
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValueOnce({ id: "job-2", status: "QUEUED" });
  renderPage();
  select("Grupa treningowa", "Grupa dzieci");
  select("Sprzęt treningowy", "Tarcze");
  fireEvent.click(screen.getByRole("button", { name: "Generuj Plan" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Nie udało się rozpocząć generowania planu",
  );
  expect(
    screen.getByRole("combobox", { name: "Grupa treningowa" }),
  ).toHaveTextContent("Grupa dzieci");
  expect(screen.getByRole("button", { name: "Usuń Tarcze" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Generuj Plan" }));
  expect(await screen.findByText("Zadanie: job-2")).toBeVisible();
});
