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
});
