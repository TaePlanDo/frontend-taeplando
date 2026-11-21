import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CustomizedPagination } from "./CustomizedPagination";

function renderPagination() {
  const goToPage = vi.fn();

  render(
    <CustomizedPagination
      pagesNumber={54}
      currentPage={20}
      goToPage={goToPage}
    />,
  );

  return {
    goToPage,
    pageInput: screen.getByRole("spinbutton", {
      name: "Numer strony od 1 do 54",
    }),
    submitButton: screen.getByRole("button", { name: "Przejdź" }),
  };
}

describe("CustomizedPagination", () => {
  it("allows typing a page number to jump directly to it", () => {
    const { goToPage, pageInput, submitButton } = renderPagination();

    fireEvent.change(pageInput, { target: { value: "40" } });
    fireEvent.click(submitButton);

    expect(goToPage).toHaveBeenCalledWith(40);
  });

  it("ignores a non-integer page", () => {
    const { goToPage, pageInput, submitButton } = renderPagination();

    fireEvent.change(pageInput, { target: { value: "1.5" } });
    fireEvent.click(submitButton);

    expect(goToPage).not.toHaveBeenCalled();
    expect(pageInput).toHaveValue(null);
  });
});
