import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DeltaMinutesBadge } from "./DeltaMinutesBadge";

describe("DeltaMinutesBadge", () => {
  it("hides zero and shows positive and negative differences", () => {
    const { container, rerender } = render(
      <DeltaMinutesBadge deltaMinutes={0} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<DeltaMinutesBadge deltaMinutes={5} />);
    expect(screen.getByText("+5 min")).toBeInTheDocument();

    rerender(<DeltaMinutesBadge deltaMinutes={-5} />);
    expect(screen.getByText("-5 min")).toBeInTheDocument();

    rerender(<DeltaMinutesBadge deltaMinutes={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});
