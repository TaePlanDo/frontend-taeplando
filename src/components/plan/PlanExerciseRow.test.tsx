import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { planFixture } from "@/test/planFixture";
import { PlanExerciseRow } from "./PlanExerciseRow";

let theme: "dark" | "light" = "dark";
vi.mock("@/hooks/useTheme", () => ({ useTheme: () => ({ theme }) }));

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: { x: 0, y: 50, scaleX: 1, scaleY: 2 },
    transition: undefined,
    isDragging: true,
  }),
}));

it("moves a dragged row without scaling it to another row's height", () => {
  render(
    <PlanExerciseRow
      exercise={planFixture.exercises[0]}
      number={1}
      onReplace={vi.fn()}
      onRemove={vi.fn()}
      canReorder
    />,
  );
  const row = screen.getByRole("button", {
    name: "Przenieś ćwiczenie Bieg",
  }).parentElement;
  expect(row?.style.transform).toBe("translate3d(0px, 50px, 0)");
});

it("uses the snapshot thumbnail for the current theme", () => {
  theme = "dark";
  const exercise = {
    ...planFixture.exercises[0],
    image_url_snapshot: "dark.webp",
    image_url_light_snapshot: "light.webp",
  };
  const props = { exercise, number: 1, onReplace: vi.fn(), onRemove: vi.fn() };
  const { rerender } = render(<PlanExerciseRow {...props} />);
  expect(screen.getByAltText("")).toHaveAttribute("src", "dark.webp");
  theme = "light";
  rerender(<PlanExerciseRow {...props} />);
  expect(screen.getByAltText("")).toHaveAttribute("src", "light.webp");
  rerender(
    <PlanExerciseRow
      {...props}
      exercise={{ ...exercise, image_url_light_snapshot: null }}
    />,
  );
  expect(screen.getByAltText("")).toHaveAttribute(
    "src",
    "/exercise-placeholder-light.svg",
  );
  theme = "dark";
});

it("shows the snapshot animation in exercise details", async () => {
  render(
    <PlanExerciseRow
      exercise={{
        ...planFixture.exercises[0],
        animation_url_snapshot: "animation.webp",
        animation_url_light_snapshot: "animation.webp",
      }}
      number={1}
      onReplace={vi.fn()}
      onRemove={vi.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Podgląd ćwiczenia Bieg" }),
  );
  const dialog = await screen.findByRole("dialog");
  expect(dialog.querySelector('img[src="animation.webp"]')).toBeInTheDocument();
});
