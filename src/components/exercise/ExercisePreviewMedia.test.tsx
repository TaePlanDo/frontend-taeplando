import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mapPlanExerciseToSnapshot } from "@/lib/mappers/plan";
import { planFixture } from "@/test/planFixture";
import { ExercisePreviewMedia } from "./ExercisePreviewMedia";

let theme: "dark" | "light" = "dark";
vi.mock("@/hooks/useTheme", () => ({ useTheme: () => ({ theme }) }));

const exercise = {
  ...mapPlanExerciseToSnapshot(planFixture.exercises[0]),
  image_url: "thumb-dark.webp",
  image_url_light: "thumb-light.webp",
  animation_url: "anim-dark.webp",
  animation_url_light: "anim-light.webp",
};

describe("ExercisePreviewMedia", () => {
  beforeEach(() => {
    theme = "dark";
  });

  it("shows the thumbnail until the animation loads and switches theme", () => {
    const { container, rerender } = render(
      <ExercisePreviewMedia exercise={exercise} />,
    );
    expect(container.querySelector('img[src="thumb-dark.webp"]')).toBeVisible();
    const animation = container.querySelector('img[src="anim-dark.webp"]')!;
    expect(animation).toHaveAttribute("loading", "lazy");
    expect(animation).toHaveClass("invisible");
    fireEvent.load(animation);
    expect(animation).not.toHaveClass("invisible");
    expect(container.querySelector('img[src="thumb-dark.webp"]')).toBeNull();
    theme = "light";
    rerender(<ExercisePreviewMedia exercise={exercise} />);
    expect(
      container.querySelector('img[src="thumb-light.webp"]'),
    ).toBeVisible();
    expect(container.querySelector('img[src="anim-light.webp"]')).toHaveClass(
      "invisible",
    );
  });

  it("keeps the thumbnail when the animation fails and shows a placeholder if the thumbnail fails", () => {
    const { container } = render(<ExercisePreviewMedia exercise={exercise} />);
    fireEvent.error(container.querySelector('img[src="anim-dark.webp"]')!);
    expect(screen.getByAltText("")).toHaveAttribute("src", "thumb-dark.webp");
    fireEvent.error(screen.getByAltText(""));
    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      "/exercise-placeholder-dark.svg",
    );
  });

  it("shows a placeholder while the animation loads if the thumbnail is missing or fails", () => {
    const { container, rerender } = render(
      <ExercisePreviewMedia exercise={{ ...exercise, image_url: null }} />,
    );
    expect(
      container.querySelector('img[src="/exercise-placeholder-dark.svg"]'),
    ).toBeVisible();
    rerender(<ExercisePreviewMedia exercise={exercise} />);
    fireEvent.error(container.querySelector('img[src="thumb-dark.webp"]')!);
    expect(
      container.querySelector('img[src="/exercise-placeholder-dark.svg"]'),
    ).toBeVisible();
    fireEvent.load(container.querySelector('img[src="anim-dark.webp"]')!);
    expect(container.querySelector('img[src="anim-dark.webp"]')).toBeVisible();
  });

  it("shows the thumbnail or placeholder when no animation is available", () => {
    const { rerender } = render(
      <ExercisePreviewMedia exercise={{ ...exercise, animation_url: null }} />,
    );
    expect(screen.getByAltText("")).toHaveAttribute("src", "thumb-dark.webp");
    rerender(
      <ExercisePreviewMedia
        exercise={{ ...exercise, animation_url: null, image_url: null }}
      />,
    );
    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      "/exercise-placeholder-dark.svg",
    );
  });
});
