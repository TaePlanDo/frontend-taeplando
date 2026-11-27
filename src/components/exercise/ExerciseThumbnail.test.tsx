import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseThumbnail } from "./ExerciseThumbnail";

let theme: "dark" | "light" = "dark";
vi.mock("@/hooks/useTheme", () => ({ useTheme: () => ({ theme }) }));

const props = {
  darkUrl: "https://example.com/dark.webp",
  lightUrl: "https://example.com/light.webp",
  isOffline: false,
};

describe("ExerciseThumbnail", () => {
  beforeEach(() => {
    theme = "dark";
  });

  it("loads the selected theme lazily and shows a skeleton until loaded", () => {
    const { rerender } = render(<ExerciseThumbnail {...props} />);
    const image = screen.getByAltText("");
    expect(image).toHaveAttribute("src", props.darkUrl);
    expect(image).toHaveAttribute("loading", "lazy");
    expect(screen.getByTestId("thumbnail-skeleton")).toBeInTheDocument();
    fireEvent.load(image);
    expect(screen.queryByTestId("thumbnail-skeleton")).not.toBeInTheDocument();

    theme = "light";
    rerender(<ExerciseThumbnail {...props} />);
    expect(screen.getByAltText("")).toHaveAttribute("src", props.lightUrl);
    expect(screen.getByTestId("thumbnail-skeleton")).toBeInTheDocument();
  });

  it("shows the theme placeholder when the image fails and keeps it after loading", () => {
    theme = "light";
    render(<ExerciseThumbnail {...props} />);
    const image = screen.getByAltText("");
    fireEvent.error(image);
    expect(image).toHaveAttribute("src", "/exercise-placeholder-light.svg");
    expect(screen.queryByTestId("thumbnail-skeleton")).not.toBeInTheDocument();
    fireEvent.load(image);
    expect(image).toHaveAttribute("src", "/exercise-placeholder-light.svg");
  });

  it.each([
    { ...props, darkUrl: null },
    { ...props, isOffline: true },
  ])(
    "shows the placeholder without fetching an unavailable thumbnail",
    (input) => {
      render(<ExerciseThumbnail {...input} />);
      expect(screen.getByAltText("")).toHaveAttribute(
        "src",
        "/exercise-placeholder-dark.svg",
      );
      expect(
        screen.queryByTestId("thumbnail-skeleton"),
      ).not.toBeInTheDocument();
    },
  );
});
