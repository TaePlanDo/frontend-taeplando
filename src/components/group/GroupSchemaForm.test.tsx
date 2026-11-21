import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import type { Group } from "@/types/group";

import { GroupSchemaForm } from "./GroupSchemaForm";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const updateGroupSchema = vi.fn();

vi.mock("@/hooks/groups/useUpdateGroupSchema", () => ({
  useUpdateGroupSchema: () => ({
    updateGroupSchema,
    isUpdating: false,
    error: null,
  }),
}));

vi.mock("@/hooks/groups/useTrainingSegments", () => ({
  useTrainingSegments: () => ({
    segments: [
      { id: 1, code: "WARMUP", name: "Rozgrzewka" },
      { id: 3, code: "MAIN", name: "Część główna" },
      { id: 4, code: "COOLDOWN", name: "Wyciszenie" },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const group: Group = {
  id: "group-1",
  name: "Młodzież",
  min_age: 7,
  max_age: 14,
  duration_minutes: 60,
  created_at: "2026-10-11T12:00:00Z",
  updated_at: "2026-10-11T12:00:00Z",
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

describe("GroupSchemaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the current schema and allows saving MAIN 100%", async () => {
    updateGroupSchema.mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<GroupSchemaForm group={group} onClose={onClose} />);

    expect(
      screen.getByRole("region", { name: "Schemat treningu" }),
    ).toBeTruthy();
    expect(screen.getByText("SUMA 100%")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Zapisz schemat" }));

    await waitFor(() => {
      expect(updateGroupSchema).toHaveBeenCalledWith("group-1", {
        items: [{ segment_id: 3, percentage: 100 }],
      });
      expect(toast.success).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("adds an unused segment at 1% taken from the largest row", async () => {
    render(<GroupSchemaForm group={group} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Dodaj segment" }));
    fireEvent.click(await screen.findByRole("option", { name: "Rozgrzewka" }));

    expect(screen.getByLabelText("Usuń Rozgrzewka")).toBeTruthy();
    expect(screen.getByText("(1%)")).toBeTruthy();
    expect(screen.getByText("(99%)")).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "Zapisz schemat",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);

    fireEvent.click(screen.getByRole("combobox", { name: "Dodaj segment" }));
    expect(screen.queryByRole("option", { name: "Część główna" })).toBeNull();
  });

  it("keeps the dialog open and skips the success toast when save fails", async () => {
    updateGroupSchema.mockRejectedValue(new Error("fail"));
    const onClose = vi.fn();
    render(<GroupSchemaForm group={group} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Zapisz schemat" }));

    await waitFor(() => {
      expect(updateGroupSchema).toHaveBeenCalled();
    });
    expect(toast.success).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("saves exact percentages changed through a segment slider", async () => {
    updateGroupSchema.mockResolvedValue(undefined);
    render(<GroupSchemaForm group={group} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Dodaj segment" }));
    fireEvent.click(await screen.findByRole("option", { name: "Rozgrzewka" }));

    expect(
      screen.getByRole("button", { name: "Zwiększ udział: Rozgrzewka" }),
    ).toBeDisabled();
    fireEvent.click(
      screen.getByRole("button", { name: "Zmniejsz udział: Część główna" }),
    );
    expect(screen.getByLabelText("Łączny udział segmentów")).toHaveTextContent(
      "Łącznie: 99% · Wolne: 1%",
    );
    expect(
      screen.getByRole("button", { name: "Zapisz schemat" }),
    ).toBeDisabled();

    fireEvent.keyDown(
      screen.getByRole("slider", { name: "Udział: Rozgrzewka" }),
      {
        key: "ArrowRight",
      },
    );
    expect(screen.getByText("(2%)")).toBeTruthy();
    expect(screen.getByText("(98%)")).toBeTruthy();
    expect(screen.getByLabelText("Łączny udział segmentów")).toHaveTextContent(
      "Łącznie: 100% · Wolne: 0%",
    );
    fireEvent.click(screen.getByRole("button", { name: "Zapisz schemat" }));

    await waitFor(() =>
      expect(updateGroupSchema).toHaveBeenCalledWith("group-1", {
        items: [
          { segment_id: 3, percentage: 98 },
          { segment_id: 1, percentage: 2 },
        ],
      }),
    );
  });

  it("supports one-percent buttons and keeps save disabled until the pool is allocated", () => {
    render(<GroupSchemaForm group={group} onClose={vi.fn()} />);
    const increase = screen.getByRole("button", {
      name: "Zwiększ udział: Część główna",
    });
    const decrease = screen.getByRole("button", {
      name: "Zmniejsz udział: Część główna",
    });
    const save = screen.getByRole("button", { name: "Zapisz schemat" });
    expect(increase).toBeDisabled();
    fireEvent.click(decrease);
    expect(screen.getByLabelText("Łączny udział segmentów")).toHaveTextContent(
      "Łącznie: 99% · Wolne: 1%",
    );
    expect(screen.getByText("SUMA 99%")).toBeTruthy();
    expect(save).toBeDisabled();
    expect(increase).toBeEnabled();

    fireEvent.click(increase);
    expect(save).toBeEnabled();
    expect(screen.getByText("(100%)")).toBeTruthy();

    fireEvent.keyDown(
      screen.getByRole("slider", { name: "Udział: Część główna" }),
      { key: "Home" },
    );
    expect(screen.getByText("(1%)")).toBeTruthy();
    expect(decrease).toBeDisabled();
    expect(save).toBeDisabled();
  });

  it("keeps free percentages unallocated when removing and re-adding a segment", async () => {
    render(<GroupSchemaForm group={group} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Dodaj segment" }));
    fireEvent.click(await screen.findByRole("option", { name: "Rozgrzewka" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Zmniejsz udział: Część główna" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Usuń Rozgrzewka" }));

    expect(screen.getByText("(98%)")).toBeTruthy();
    expect(screen.getByLabelText("Łączny udział segmentów")).toHaveTextContent(
      "Łącznie: 98% · Wolne: 2%",
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Dodaj segment" }));
    fireEvent.click(await screen.findByRole("option", { name: "Rozgrzewka" }));
    expect(screen.getByText("(98%)")).toBeTruthy();
    expect(screen.getByText("(1%)")).toBeTruthy();
    expect(screen.getByLabelText("Łączny udział segmentów")).toHaveTextContent(
      "Łącznie: 99% · Wolne: 1%",
    );
    expect(
      screen.getByRole("button", { name: "Zapisz schemat" }),
    ).toBeDisabled();
  });

  it("preserves an incomplete total when adjusting the desktop divider", async () => {
    render(<GroupSchemaForm group={group} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Dodaj segment" }));
    fireEvent.click(await screen.findByRole("option", { name: "Rozgrzewka" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Zmniejsz udział: Część główna" }),
    );

    fireEvent.keyDown(
      screen.getByRole("separator", {
        name: "Zmień podział między Część główna a Rozgrzewka",
      }),
      { key: "ArrowLeft" },
    );

    expect(screen.getByText("(97%)")).toBeTruthy();
    expect(screen.getByText("(2%)")).toBeTruthy();
    expect(screen.getByText("SUMA 99%")).toBeTruthy();
    expect(screen.getByLabelText("Łączny udział segmentów")).toHaveTextContent(
      "Łącznie: 99% · Wolne: 1%",
    );
    expect(
      screen.getByRole("button", { name: "Zapisz schemat" }),
    ).toBeDisabled();
  });
});
