import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ListStateView } from "./ListStateView";

describe("ListStateView", () => {
  it("marks an empty cached list as stale after a refresh error", () => {
    render(
      <ListStateView
        state={{ kind: "stale", reason: "error", isEmpty: true }}
        errorTitle="Nie udało się pobrać elementów"
        errorMessage="Spróbuj ponownie"
        onRetry={vi.fn()}
        isRetrying={false}
        emptyTitle="Brak elementów"
        emptyMessage="Dodaj pierwszy element"
      >
        <p>Lista elementów</p>
      </ListStateView>,
    );

    expect(
      screen.getByText(
        "Nie udało się odświeżyć listy — wyświetlane są ostatnio pobrane dane.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Brak elementów")).toBeTruthy();
    expect(screen.queryByText("Lista elementów")).toBeNull();
  });
});
