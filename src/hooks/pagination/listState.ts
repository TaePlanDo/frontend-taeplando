export type PaginatedListState =
  | { kind: "loading"; hasData: boolean }
  | { kind: "unavailable"; reason: "offline" | "error" }
  | { kind: "empty" }
  | {
      kind: "stale";
      reason: "offline" | "error";
      isEmpty: boolean;
    }
  | { kind: "ready" };

type PaginatedListStateInput = {
  hasData: boolean;
  isOnline: boolean;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
};

export function getPaginatedListState({
  hasData,
  isOnline,
  isLoading,
  isError,
  isEmpty,
}: PaginatedListStateInput): PaginatedListState {
  if (!hasData) {
    if (!isOnline) return { kind: "unavailable", reason: "offline" };
    if (isError) return { kind: "unavailable", reason: "error" };
    return { kind: "loading", hasData: false };
  }

  if (isLoading) return { kind: "loading", hasData: true };
  if (!isOnline) return { kind: "stale", reason: "offline", isEmpty };
  if (isError) return { kind: "stale", reason: "error", isEmpty };
  if (isEmpty) return { kind: "empty" };
  return { kind: "ready" };
}

export function hasDisplayableListData(state: PaginatedListState) {
  return (
    state.kind === "ready" ||
    state.kind === "empty" ||
    state.kind === "stale" ||
    (state.kind === "loading" && state.hasData)
  );
}
