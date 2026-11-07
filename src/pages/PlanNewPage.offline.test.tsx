import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";

import {
  getEquipmentRequest,
  getTrainingTypesRequest,
} from "@/lib/api/catalogs";
import { getAllGroupsRequest } from "@/lib/api/group";
import { PlanNewPage } from "./PlanNewPage";

vi.mock("@/lib/api/group", () => ({ getAllGroupsRequest: vi.fn() }));
vi.mock("@/lib/api/catalogs", () => ({
  getEquipmentRequest: vi.fn(),
  getTrainingTypesRequest: vi.fn(),
}));

afterEach(() => {
  onlineManager.setOnline(true);
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("reports an offline start attempt and keeps the form editable without sending it later", async () => {
  vi.mocked(getAllGroupsRequest).mockResolvedValue([
    {
      id: "group-1",
      name: "Grupa",
      min_age: 5,
      max_age: 15,
      duration_minutes: 60,
      created_at: "",
      updated_at: "",
      schema: [],
    },
  ]);
  vi.mocked(getEquipmentRequest).mockResolvedValue([]);
  vi.mocked(getTrainingTypesRequest).mockResolvedValue([]);
  const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  vi.stubGlobal("fetch", fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PlanNewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  const group = await screen.findByRole("combobox", {
    name: "Grupa treningowa",
  });
  await waitFor(() => expect(group).toBeEnabled());
  fireEvent.keyDown(group, { key: "ArrowDown" });
  fireEvent.click(screen.getByRole("option", { name: "Grupa" }));
  act(() => onlineManager.setOnline(false));
  fireEvent.click(screen.getByRole("button", { name: "Generuj plan" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Nie udało się rozpocząć generowania planu",
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("combobox", { name: "Grupa treningowa" }),
  ).toHaveTextContent("Grupa");
  expect(screen.getByRole("button", { name: "Generuj plan" })).toBeEnabled();
  act(() => onlineManager.setOnline(true));
  await waitFor(() => expect(client.isMutating()).toBe(0));
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("reports paused option requests while offline and loads them when the connection returns", async () => {
  onlineManager.setOnline(false);
  vi.mocked(getAllGroupsRequest).mockResolvedValue([
    {
      id: "group-1",
      name: "Grupa",
      min_age: 5,
      max_age: 15,
      duration_minutes: 60,
      created_at: "",
      updated_at: "",
      schema: [],
    },
  ]);
  vi.mocked(getEquipmentRequest).mockResolvedValue([
    { id: "equipment-1", name: "Tarcze" },
  ]);
  vi.mocked(getTrainingTypesRequest).mockResolvedValue([]);

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PlanNewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Brak połączenia z internetem",
  );
  expect(
    screen.getByRole("combobox", { name: "Grupa treningowa" }),
  ).toHaveTextContent("Brak połączenia");
  expect(
    screen.getByRole("combobox", { name: "Sprzęt treningowy" }),
  ).toHaveTextContent("Brak połączenia");
  expect(screen.getByRole("button", { name: "Generuj plan" })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Spróbuj ponownie" }),
  ).toBeDisabled();
  expect(getAllGroupsRequest).not.toHaveBeenCalled();

  act(() => onlineManager.setOnline(true));
  await waitFor(() =>
    expect(
      screen.getByRole("combobox", { name: "Grupa treningowa" }),
    ).toBeEnabled(),
  );
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByRole("button", { name: "Generuj plan" })).toBeEnabled();
  expect(getAllGroupsRequest).toHaveBeenCalledTimes(1);
  expect(getEquipmentRequest).toHaveBeenCalledTimes(1);
  expect(getTrainingTypesRequest).toHaveBeenCalledTimes(1);
});
