import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import type { Group } from "@/types/group";

import { GroupDetailsForm } from "./GroupDetailsForm";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const createGroup = vi.fn();
const updateGroup = vi.fn();
let isMobile = false;
vi.mock("@/hooks/useIsMobile", () => ({ useIsMobile: () => isMobile }));

const createState = {
  createGroup,
  isCreating: false,
  error: null as string | null,
};

const updateState = {
  updateGroup,
  isUpdating: false,
  error: null as string | null,
};

vi.mock("@/hooks/groups/useCreateGroup", () => ({
  useCreateGroup: () => createState,
}));

vi.mock("@/hooks/groups/useUpdateGroup", () => ({
  useUpdateGroup: () => updateState,
}));

const group: Group = {
  id: "0ac590e1-2a46-4cb7-8944-803e364cc46b",
  name: "Młodzież",
  min_age: 7,
  max_age: 14,
  duration_minutes: 90,
  created_at: "2026-10-11T12:00:00Z",
  updated_at: "2026-10-11T13:00:00Z",
  schema: [
    {
      segment_id: 3,
      segment_code: "MAIN",
      segment_name: "Część główna",
      percentage: 100,
      position: 1,
    },
  ],
};

function renderForm(formGroup: Group | null = null) {
  const onClose = vi.fn();
  render(<GroupDetailsForm group={formGroup} onClose={onClose} />);
  return { onClose };
}

function input(label: string) {
  return screen.getByLabelText(label) as HTMLInputElement;
}

function setSliderValue(slider: HTMLElement, target: number) {
  fireEvent.focus(slider);
  const difference = target - Number(slider.getAttribute("aria-valuenow"));
  for (let i = 0; i < Math.floor(Math.abs(difference) / 10); i++) {
    fireEvent.keyDown(slider, { key: difference > 0 ? "PageUp" : "PageDown" });
  }
  for (let i = 0; i < Math.abs(difference) % 10; i++) {
    fireEvent.keyDown(slider, {
      key: difference > 0 ? "ArrowRight" : "ArrowLeft",
    });
  }
}

function fillForm(values: {
  name: string;
  minAge: string;
  maxAge: string;
  hours: string;
  minutes: string;
}) {
  fireEvent.change(input("Nazwa Grupy"), { target: { value: values.name } });
  const [lower, upper] = screen.getAllByRole("slider", { name: "Wiek" });
  if (Number(values.minAge) > Number(upper.getAttribute("aria-valuenow"))) {
    setSliderValue(upper, Number(values.maxAge));
    setSliderValue(lower, Number(values.minAge));
  } else {
    setSliderValue(lower, Number(values.minAge));
    setSliderValue(upper, Number(values.maxAge));
  }
  fireEvent.change(input("Godziny"), { target: { value: values.hours } });
  fireEvent.change(input("Minuty"), { target: { value: values.minutes } });
}

describe("GroupDetailsForm", () => {
  beforeEach(() => {
    isMobile = false;
    vi.clearAllMocks();
    createGroup.mockReset();
    updateGroup.mockReset();
    createState.isCreating = false;
    createState.error = null;
    updateState.isUpdating = false;
    updateState.error = null;
  });

  it("renders empty create form with all fields", () => {
    renderForm();

    expect(input("Nazwa Grupy").value).toBe("");
    expect(input("Nazwa Grupy").placeholder).toBe("Grupa wakacyjna");
    const [lower, upper] = screen.getAllByRole("slider", { name: "Wiek" });
    expect(lower).toHaveAttribute("aria-valuenow", "1");
    expect(upper).toHaveAttribute("aria-valuenow", "99");
    expect(input("Godziny").value).toBe("0");
    expect(input("Minuty").value).toBe("0");
    expect(screen.getByText("Wiek")).toBeTruthy();
    expect(screen.getByText("Czas trwania")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Utwórz" })).toBeTruthy();
  });

  it("shows validation errors and does not call the API for an empty form", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Utwórz" }));

    expect(await screen.findByText("Nazwa grupy jest wymagana")).toBeTruthy();
    expect(screen.getByText("Podaj czas trwania treningu")).toBeTruthy();
    expect(createGroup).not.toHaveBeenCalled();
  });

  it("shows one error under the age pair when max age is lower than min age", async () => {
    renderForm({ ...group, min_age: 14, max_age: 7 });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    expect(
      await screen.findByText(
        "Maksymalny wiek nie może być mniejszy od minimalnego",
      ),
    ).toBeTruthy();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(createGroup).not.toHaveBeenCalled();
  });

  it("shows duration error when hours and minutes are zero", async () => {
    renderForm();

    fillForm({
      name: "Grupa",
      minAge: "7",
      maxAge: "14",
      hours: "0",
      minutes: "0",
    });
    fireEvent.click(screen.getByRole("button", { name: "Utwórz" }));

    expect(await screen.findByText("Podaj czas trwania treningu")).toBeTruthy();
    expect(createGroup).not.toHaveBeenCalled();
  });

  it("creates a group, shows a toast and closes the dialog", async () => {
    createGroup.mockResolvedValue(undefined);
    const { onClose } = renderForm();

    fillForm({
      name: "  Grupa wakacyjna  ",
      minAge: "7",
      maxAge: "14",
      hours: "1",
      minutes: "30",
    });
    fireEvent.click(screen.getByRole("button", { name: "Utwórz" }));

    await waitFor(() => {
      expect(createGroup).toHaveBeenCalledWith({
        name: "Grupa wakacyjna",
        min_age: 7,
        max_age: 14,
        duration_minutes: 90,
      });
      expect(toast.success).toHaveBeenCalledWith("Grupa została utworzona");
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(updateGroup).not.toHaveBeenCalled();
  });

  it("shows the API error and keeps the dialog open when create fails", async () => {
    createGroup.mockRejectedValue(new Error("fail"));
    createState.error = "Nie udało się utworzyć grupy. Spróbuj ponownie.";
    const { onClose } = renderForm();

    fillForm({
      name: "Grupa",
      minAge: "7",
      maxAge: "14",
      hours: "1",
      minutes: "0",
    });
    fireEvent.click(screen.getByRole("button", { name: "Utwórz" }));

    await waitFor(() => {
      expect(createGroup).toHaveBeenCalled();
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(
      screen.getByText("Nie udało się utworzyć grupy. Spróbuj ponownie."),
    ).toBeTruthy();
  });

  it("prefills the form when editing a group", () => {
    renderForm(group);

    expect(input("Nazwa Grupy").value).toBe("Młodzież");
    const [lower, upper] = screen.getAllByRole("slider", { name: "Wiek" });
    expect(lower).toHaveAttribute("aria-valuenow", "7");
    expect(upper).toHaveAttribute("aria-valuenow", "14");
    expect(input("Godziny").value).toBe("1");
    expect(input("Minuty").value).toBe("30");
    expect(screen.getByRole("button", { name: "Zapisz zmiany" })).toBeTruthy();
  });

  it("updates the group, shows a toast and closes the dialog", async () => {
    updateGroup.mockResolvedValue(undefined);
    const { onClose } = renderForm(group);

    fireEvent.change(input("Nazwa Grupy"), {
      target: { value: "Młodzież starsza" },
    });
    fireEvent.change(input("Minuty"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));

    await waitFor(() => {
      expect(updateGroup).toHaveBeenCalledWith(group.id, {
        name: "Młodzież starsza",
        min_age: 7,
        max_age: 14,
        duration_minutes: 105,
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Grupa została zaktualizowana",
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    expect(createGroup).not.toHaveBeenCalled();
  });

  it("shows only the update error in edit mode", () => {
    createState.error = "Błąd tworzenia";
    updateState.error = "Grupa nie istnieje";
    renderForm(group);

    expect(screen.getByText("Grupa nie istnieje")).toBeTruthy();
    expect(screen.queryByText("Błąd tworzenia")).toBeNull();
  });

  it("loads mobile duration carousels and saves the chosen duration", async () => {
    isMobile = true;
    renderForm(group);
    const hours = within(screen.getByRole("radiogroup", { name: "Godziny" }));
    const minutes = within(screen.getByRole("radiogroup", { name: "Minuty" }));
    expect(hours.getByRole("radio", { name: "1" })).toBeChecked();
    expect(minutes.getByRole("radio", { name: "30" })).toBeChecked();
    expect(hours.getAllByRole("radio")).toHaveLength(13);
    expect(minutes.getAllByRole("radio")).toHaveLength(60);
    fireEvent.click(minutes.getByRole("radio", { name: "45" }));
    fireEvent.click(screen.getByRole("button", { name: "Zapisz zmiany" }));
    await waitFor(() =>
      expect(updateGroup).toHaveBeenCalledWith(group.id, {
        name: group.name,
        min_age: 7,
        max_age: 14,
        duration_minutes: 105,
      }),
    );
  });

  it("disables mobile duration options while saving", () => {
    isMobile = true;
    createState.isCreating = true;
    renderForm();
    for (const radio of screen.getAllByRole("radio"))
      expect(radio).toBeDisabled();
  });

  it("disables all inputs and the submit button while saving", () => {
    createState.isCreating = true;
    renderForm();

    for (const label of ["Nazwa Grupy", "Godziny", "Minuty"]) {
      expect(input(label)).toBeDisabled();
    }
    for (const slider of screen.getAllByRole("slider", { name: "Wiek" })) {
      expect(slider).toHaveAttribute("data-disabled");
    }
    expect(screen.getByRole("button", { name: "Utwórz" })).toBeDisabled();
  });
});
