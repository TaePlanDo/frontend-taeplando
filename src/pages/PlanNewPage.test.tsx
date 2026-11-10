import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";

import { startPlanGenerationRequest } from "@/lib/api/plan-generation";
import { lookupMatchingPlansOrEmpty } from "@/lib/plan/matchingPlans";
import { PlanNewPage } from "./PlanNewPage";

const { useOptions } = vi.hoisted(() => ({ useOptions: vi.fn() }));

vi.mock("@/lib/api/plan-generation", () => ({
  startPlanGenerationRequest: vi.fn(),
}));
vi.mock("@/lib/plan/matchingPlans", () => ({
  lookupMatchingPlansOrEmpty: vi.fn(),
}));
vi.mock("@/hooks/plans/usePlanGenerationOptions", () => ({
  usePlanGenerationOptions: useOptions,
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

function loadedOptions() {
  return {
    groups: {
      items: [
        {
          id: "group-1",
          name: "Grupa dzieci",
          min_age: 7,
          max_age: 14,
          duration_minutes: 90,
          created_at: "2026-11-01T12:00:00Z",
          updated_at: "2026-11-01T12:00:00Z",
          schema: [
            {
              segment_id: 3,
              segment_code: "MAIN",
              segment_name: "Część główna",
              percentage: 100,
              position: 1,
            },
          ],
        },
      ],
      status: "ready",
    },
    equipment: {
      items: [{ id: "equipment-1", name: "Tarcze" }],
      status: "ready",
    },
    trainingTypes: {
      items: [{ id: "type-1", name: "Technika" }],
      status: "ready",
    },
    state: { kind: "ready" },
    retry: vi.fn(),
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  useOptions.mockReturnValue(loadedOptions());
  vi.mocked(lookupMatchingPlansOrEmpty).mockResolvedValue([]);
});

it("keeps the form visible without groups and links to group creation", () => {
  const options = loadedOptions();
  options.groups.items = [];
  options.state = { kind: "empty" };
  useOptions.mockReturnValue(options);
  renderPage();
  expect(screen.getByRole("link", { name: "Utwórz grupę" })).toHaveAttribute(
    "href",
    "/groups",
  );
  expect(screen.getByRole("button", { name: "Generuj plan" })).toBeDisabled();
  expect(screen.getByRole("slider")).toBeVisible();
});

it("shows an inline catalog error and retries only failed queries", () => {
  const retry = vi.fn().mockResolvedValue(undefined);
  useOptions.mockReturnValue({
    ...loadedOptions(),
    equipment: {
      items: [],
      status: "error",
    },
    state: {
      kind: "error",
      message: "Nie udało się pobrać sprzętu.",
      retrying: false,
    },
    retry,
  });
  renderPage();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Nie udało się pobrać sprzętu.",
  );
  expect(screen.getByRole("button", { name: "Generuj plan" })).toBeDisabled();
  expect(
    screen.getByRole("combobox", { name: "Sprzęt treningowy" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Spróbuj ponownie" }));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(startPlanGenerationRequest).not.toHaveBeenCalled();
});

it("rejects equipment removed from the catalog after selection", async () => {
  const options = loadedOptions();
  useOptions.mockReturnValue(options);
  renderPage();
  select("Grupa treningowa", "Grupa dzieci");
  select("Sprzęt treningowy", "Tarcze");
  options.equipment.items = [];
  fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
  expect(
    await screen.findByText(
      "Wybrany sprzęt jest niedostępny. Usuń go z listy.",
    ),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: "Usuń Niedostępny element (equipment-1)",
    }),
  ).toBeEnabled();
  expect(startPlanGenerationRequest).not.toHaveBeenCalled();
});

it("requires a group and submits Auto with 20 participants and no equipment", async () => {
  vi.mocked(startPlanGenerationRequest).mockResolvedValue({
    id: "job-1",
    status: "QUEUED",
  });
  renderPage();
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
  expect(await screen.findByText("Wybierz grupę treningową")).toBeVisible();
  expect(startPlanGenerationRequest).not.toHaveBeenCalled();
  select("Grupa treningowa", "Grupa dzieci");
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
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
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
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
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Nie udało się rozpocząć generowania planu",
  );
  expect(
    screen.getByRole("combobox", { name: "Grupa treningowa" }),
  ).toHaveTextContent("Grupa dzieci");
  expect(screen.getByRole("button", { name: "Usuń Tarcze" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
  expect(await screen.findByText("Zadanie: job-2")).toBeVisible();
});

it("opens the choice dialog when matching plans exist and generates only after confirm", async () => {
  vi.mocked(lookupMatchingPlansOrEmpty).mockResolvedValue([
    {
      id: "plan-1",
      training_group_id: "group-1",
      name: "Istniejący plan",
      participant_count: 20,
      group_name_snapshot: "Grupa dzieci",
      group_min_age_snapshot: 7,
      group_max_age_snapshot: 14,
      training_duration_snapshot: 90,
      available_equipment_snapshot: [],
      training_types_snapshot: [],
      schema_snapshot: [],
      generated_at: "2026-11-06T12:00:00Z",
    },
  ]);
  vi.mocked(startPlanGenerationRequest).mockResolvedValue({
    id: "job-9",
    status: "QUEUED",
  });
  renderPage();
  select("Grupa treningowa", "Grupa dzieci");
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));

  expect(
    await screen.findByRole("heading", { name: "Wybierz z ostatnich planów" }),
  ).toBeVisible();
  expect(startPlanGenerationRequest).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Generuj nowy plan" }));
  expect(await screen.findByText("Zadanie: job-9")).toBeVisible();
  expect(startPlanGenerationRequest).toHaveBeenCalledTimes(1);
});

it("navigates to a matching plan and restores form draft on back", async () => {
  vi.mocked(lookupMatchingPlansOrEmpty).mockResolvedValue([
    {
      id: "plan-42",
      training_group_id: "group-1",
      name: "Plan do otwarcia",
      participant_count: 20,
      group_name_snapshot: "Grupa dzieci",
      group_min_age_snapshot: 7,
      group_max_age_snapshot: 14,
      training_duration_snapshot: 90,
      available_equipment_snapshot: [],
      training_types_snapshot: [],
      schema_snapshot: [],
      generated_at: "2026-11-06T12:00:00Z",
    },
  ]);

  function PlanDetailBack() {
    const navigate = useNavigate();
    const location = useLocation();
    return (
      <button
        type="button"
        onClick={() => navigate(location.state?.backTo ?? "/plans")}
      >
        Wróć
      </button>
    );
  }

  function PlanNewWithLocation() {
    const { pathname, search } = useLocation();
    return (
      <>
        <div data-testid="location">{`${pathname}${search}`}</div>
        <PlanNewPage />
      </>
    );
  }

  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { mutations: { retry: false } },
        })
      }
    >
      <MemoryRouter initialEntries={["/plans/new"]}>
        <Routes>
          <Route path="/plans/new" element={<PlanNewWithLocation />} />
          <Route path="/plans/:planId" element={<PlanDetailBack />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  select("Grupa treningowa", "Grupa dzieci");
  select("Sprzęt treningowy", "Tarcze");
  select("Typ treningu", "Technika");
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
  fireEvent.click(
    await screen.findByRole("link", { name: /Plan do otwarcia/ }),
  );
  expect(await screen.findByRole("button", { name: "Wróć" })).toBeVisible();
  expect(startPlanGenerationRequest).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Wróć" }));
  expect(
    await screen.findByRole("combobox", { name: "Grupa treningowa" }),
  ).toHaveTextContent("Grupa dzieci");
  expect(screen.getByRole("button", { name: "Usuń Tarcze" })).toBeVisible();
  expect(
    screen.getByRole("combobox", { name: "Typ treningu" }),
  ).toHaveTextContent("Technika");
  await waitFor(() => {
    expect(screen.getByTestId("location")).toHaveTextContent("/plans/new");
    expect(screen.getByTestId("location").textContent).not.toContain("?");
  });
});
